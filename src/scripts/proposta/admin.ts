// Painel de propostas: login, lista e editor com salvamento automático e prévia ao vivo.
import { renderProposta, brl, diasTxt, totalDias, h, type Proposta } from './render';
import { PRODUTOS, type Produto } from '../../data/produtos';

type Prop = Proposta & { cliente: Proposta['cliente'] & { whatsapp: string; email: string }; produtos: string[]; notasInternas: string };
type Resumo = Pick<Proposta, 'id' | 'titulo' | 'cliente' | 'status' | 'atualizadaEm' | 'aceite'> & {
  visualizacoes: { total: number; ultima: string | null };
};

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const views = { login: $('v-login'), list: $('v-list'), editor: $('v-editor') };
const top = $('ad-top');
const toast = $('toast');
const saveState = $('save-state');

function showToast(text: string) {
  toast.textContent = text;
  toast.classList.add('is-on');
  setTimeout(() => toast.classList.remove('is-on'), 2400);
}

async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: { ...(init.body ? { 'content-type': 'application/json' } : {}), ...(init.headers ?? {}) },
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (r.status === 401) { show('login'); throw new Error('unauthorized'); }
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

/* Bolhas de mercúrio do login, com parallax suave no mouse */
const stage = $('ml-stage');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const blobs = Array.from({ length: 6 }, (_, i) => {
  const b = h('div', { class: i === 2 ? 'ml-blob ml-blob--lime' : 'ml-blob' });
  const size = Math.random() * 200 + 150;
  Object.assign(b.style, {
    width: `${size}px`, height: `${size}px`, left: `${Math.random() * 80 + 10}%`, top: `${Math.random() * 80 + 10}%`,
    animationDelay: `${Math.random() * -20}s`, animationDuration: `${Math.random() * 15 + 15}s`,
  });
  stage.append(b);
  return b;
});
document.addEventListener('mousemove', (e) => {
  if (views.login.hidden || reduceMotion) return;
  const x = e.clientX / innerWidth, y = e.clientY / innerHeight;
  blobs.forEach((b, i) => { const s = (i + 1) * 20; b.style.marginLeft = `${x * s}px`; b.style.marginTop = `${y * s}px`; });
});

function show(view: keyof typeof views) {
  for (const [k, el] of Object.entries(views)) el.hidden = k !== view;
  top.hidden = view === 'login';
  if (view === 'login') setTimeout(() => $('l-user').focus(), 50);
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const clientUrl = (id: string) => `${location.origin}/p/${id}`;
const STATUS: Record<Proposta['status'], string> = { rascunho: 'Rascunho', enviada: 'Enviada', aceita: 'Aceita', recusada: 'Recusada' };

/* ================= LOGIN ================= */
$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const msg = $('login-msg');
  msg.textContent = '';
  const btn = form.querySelector('button')!;
  btn.disabled = true;
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ usuario: (form.elements.namedItem('usuario') as HTMLInputElement).value, senha: (form.elements.namedItem('senha') as HTMLInputElement).value }),
    });
    if (r.status === 503) msg.textContent = 'O login ainda não foi configurado no Netlify (PROPOSTAS_USUARIO e PROPOSTAS_SENHA).';
    else if (r.status === 429) msg.textContent = 'Muitas tentativas. Aguarde um minuto.';
    else if (!r.ok) {
      msg.textContent = 'Usuário ou senha incorretos.';
      views.login.classList.remove('is-shake'); void views.login.offsetWidth; views.login.classList.add('is-shake');
    }
    else { form.reset(); route(); }
  } catch { msg.textContent = 'Sem conexão. Tente de novo.'; }
  btn.disabled = false;
});

$('logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  history.pushState(null, '', '/propostas/');
  show('login');
});

/* ================= LISTA ================= */
async function loadList() {
  show('list');
  saveState.textContent = '';
  const list = $('list');
  list.replaceChildren(h('p', { class: 'ad-empty' }, 'Carregando…'));
  const items = await api<Resumo[]>('/api/admin/propostas');
  if (!items.length) {
    list.replaceChildren(h('div', { class: 'ad-empty' }, 'Nenhuma proposta ainda. Clique em “Nova proposta” para começar.'));
    return;
  }
  list.replaceChildren(
    ...items.map((p) => {
      const v = p.visualizacoes;
      const seen = v.total ? `Aberta ${v.total}× · última em ${fmtDate(v.ultima!)}` : p.status === 'rascunho' ? 'Não enviada' : 'Cliente ainda não abriu';
      const copy = h('button', { class: 'btn btn--ghost btn--sm', type: 'button' }, 'Copiar link');
      copy.addEventListener('click', () => copyLink(p.id, p.status));
      const dup = h('button', { class: 'btn btn--ghost btn--sm', type: 'button' }, 'Duplicar');
      dup.addEventListener('click', () => duplicate(p.id));
      const edit = h('a', { class: 'btn btn--sm', href: `/propostas/?id=${p.id}` }, 'Editar');
      edit.addEventListener('click', (e) => { e.preventDefault(); go(p.id); });
      const title = h('a', { href: `/propostas/?id=${p.id}` }, p.titulo || 'Sem título');
      title.addEventListener('click', (e) => { e.preventDefault(); go(p.id); });
      return h('article', { class: 'ad-card' },
        h('h2', {}, title),
        h('div', { class: 'ad-card__actions' }, edit, copy, dup),
        h('div', { class: 'ad-card__meta' },
          h('span', { class: `ad-pill ad-pill--${p.status}` }, STATUS[p.status]),
          [p.cliente.nome, p.cliente.empresa].filter(Boolean).join(' · ') || 'Sem cliente',
          h('span', {}, seen),
          p.aceite ? h('strong', {}, `Aceita por ${p.aceite.nome} em ${fmtDate(p.aceite.em)}`) : null,
          h('span', {}, `Editada ${fmtDate(p.atualizadaEm)}`),
        ),
      );
    }),
  );
}

$('new-proposal').addEventListener('click', async () => {
  const p = await api<Proposta>('/api/admin/propostas', { method: 'POST', body: '{}' });
  go(p.id);
});

async function duplicate(id: string) {
  const p = await api<Proposta>('/api/admin/propostas', { method: 'POST', body: JSON.stringify({ duplicarDe: id }) });
  showToast('Proposta duplicada');
  go(p.id);
}

/* ================= ENVIO ================= */
/** Número no formato do WhatsApp (com 55). */
const waNumber = (digits: string) => {
  const d = digits.replace(/\D/g, '');
  if (!d) return '';
  return d.startsWith('55') && d.length >= 12 ? d : `55${d}`;
};
/** (65) 99811-3738 para exibir no campo. */
const fmtPhone = (digits: string) => {
  let d = digits.replace(/\D/g, '');
  if (d.startsWith('55') && d.length >= 12) d = d.slice(2);
  if (d.length < 10) return d;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
};

async function copyLink(id: string, status: Proposta['status']) {
  if (current?.id === id) { if (!(await ensureReady())) return; }
  else if (status === 'rascunho') {
    if (!confirm('Esta proposta ainda é um rascunho e o cliente não consegue abrir. Marcar como “Enviada” e copiar o link?')) return;
    const p = await api<Prop>(`/api/admin/propostas/${id}`);
    await api(`/api/admin/propostas/${id}`, { method: 'PUT', body: JSON.stringify({ ...p, status: 'enviada' }) });
  }
  try { await navigator.clipboard.writeText(clientUrl(id)); showToast('Link copiado'); }
  catch { prompt('Copie o link do cliente:', clientUrl(id)); }
  if (!current) loadList();
}

/** Antes de enviar: salva o que estiver pendente e tira do rascunho. */
async function ensureReady() {
  if (!current) return false;
  if (current.status === 'rascunho') {
    if (!confirm('A proposta está como rascunho. Marcar como “Enviada” para o cliente conseguir abrir?')) return false;
    current.status = 'enviada';
    $<HTMLSelectElement>('f-status').value = 'enviada';
    dirty = true;
  }
  if (dirty) await save();
  return !dirty;
}

function mensagem() {
  const nome = current!.cliente.nome.split(/[\s/]+/)[0];
  return `Olá${nome ? `, ${nome}` : ''}! Segue a proposta da Astravox: ${clientUrl(current!.id)}\n\nVocê pode ver todos os detalhes e aprovar direto por esse link. Qualquer dúvida, estou à disposição.`;
}

$('send-wa').addEventListener('click', async () => {
  if (!current || !(await ensureReady())) return;
  const n = waNumber(current.cliente.whatsapp);
  window.open(`https://wa.me/${n}?text=${encodeURIComponent(mensagem())}`, '_blank', 'noopener');
  if (!n) showToast('Sem WhatsApp do cliente: escolha o contato no WhatsApp');
});

$('send-mail').addEventListener('click', async () => {
  if (!current) return;
  if (!current.cliente.email) { showToast('Preencha o e-mail do cliente'); $('c-mail').focus(); return; }
  if (!(await ensureReady())) return;
  const assunto = `Proposta Astravox: ${current.titulo}`;
  location.href = `mailto:${encodeURIComponent(current.cliente.email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem())}`;
});

$('copy-link').addEventListener('click', () => current && copyLink(current.id, current.status));

/* ================= EDITOR ================= */
let current: (Prop & { visualizacoes?: Resumo['visualizacoes'] }) | null = null;
let dirty = false;
let saving: Promise<void> | null = null;
const form = $<HTMLFormElement>('editor-form');
const preview = $('preview');
const saveBtn = $<HTMLButtonElement>('save');
const backupKey = (id: string) => `ax-proposta-${id}`;

const getPath = (obj: any, path: string) => path.split('.').reduce((o, k) => o?.[k], obj);
function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;
  keys.reduce((o, k) => o[k], obj)[last] = value;
}

type Field = { key?: string; placeholder: string; type?: 'text' | 'area' | 'money' | 'days'; short?: boolean };
type ListDef = { blank: () => any; fields: Field[] };
const LISTS: Record<string, ListDef> = {
  objetivos: { blank: () => '', fields: [{ placeholder: 'Objetivo' }] },
  escopo: { blank: () => ({ titulo: '', descricao: '' }), fields: [{ key: 'titulo', placeholder: 'Item' }, { key: 'descricao', placeholder: 'Descrição (opcional)', type: 'area' }] },
  cronograma: { blank: () => ({ titulo: '', dias: 1 }), fields: [{ key: 'titulo', placeholder: 'Etapa' }, { key: 'dias', placeholder: 'Dias', type: 'days' }] },
  'investimento.itens': { blank: () => ({ descricao: '', valor: 0 }), fields: [{ key: 'descricao', placeholder: 'Descrição' }, { key: 'valor', placeholder: 'R$ 0,00', type: 'money', short: true }] },
};

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`;
}

/** Contador de dias: [ − ] 2 dias [ + ] */
function daysStepper(get: () => number, set: (n: number) => void) {
  const out = h('output', { class: 'ad-days__value', 'aria-live': 'polite' });
  const show = () => { out.textContent = diasTxt(get()); minus.disabled = get() <= 0; };
  const minus = h('button', { type: 'button', class: 'ad-days__btn', 'aria-label': 'Menos um dia' }, '−') as HTMLButtonElement;
  const plus = h('button', { type: 'button', class: 'ad-days__btn', 'aria-label': 'Mais um dia' }, '+') as HTMLButtonElement;
  minus.addEventListener('click', () => { set(Math.max(0, get() - 1)); show(); });
  plus.addEventListener('click', () => { set(Math.min(365, get() + 1)); show(); });
  show();
  return h('div', { class: 'ad-days', role: 'group', 'aria-label': 'Dias da etapa' }, minus, out, plus);
}

/** Reordenar arrastando pela alça (mouse e toque); com a alça em foco, ↑/↓ do teclado também movem. */
function makeDraggable(handle: HTMLElement, row: HTMLElement, wrap: Element, arr: any[], path: string, index: number) {
  const move = (to: number) => {
    if (to < 0 || to >= arr.length || to === index) return;
    const [item] = arr.splice(index, 1);
    arr.splice(to, 0, item);
    renderList(path);
    changed();
    (wrap.querySelectorAll<HTMLElement>('.ad-handle')[to])?.focus();
  };
  handle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); move(index - 1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(index + 1); }
  });
  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    row.classList.add('is-dragging');
    const rows = () => [...wrap.querySelectorAll<HTMLElement>(':scope > .ad-row')];
    // Acompanha o ponteiro pela página inteira: mover a linha no DOM não pode interromper o arraste.
    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      ev.preventDefault();
      const others = rows().filter((r) => r !== row);
      const after = others.find((r) => { const bx = r.getBoundingClientRect(); return ev.clientY < bx.top + bx.height / 2; }) ?? null;
      if (row.nextElementSibling !== after || (after === null && wrap.lastElementChild !== row)) wrap.insertBefore(row, after);
    };
    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      row.classList.remove('is-dragging');
      const to = rows().indexOf(row);
      if (to !== index) move(to); else renderList(path);
    };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  });
}

function renderList(path: string) {
  const def = LISTS[path];
  const arr: any[] = getPath(current, path);
  const wrap = form.querySelector(`[data-list="${path}"]`)!;
  wrap.replaceChildren(
    ...arr.map((item, i) => {
      const line = h('div', { class: 'ad-row__line' });
      const fields = h('div', { class: 'ad-row__fields' }, line);
      for (const f of def.fields) {
        const value = f.key ? item[f.key] : item;
        if (f.type === 'days') {
          line.append(daysStepper(() => arr[i][f.key!] || 0, (n) => { arr[i][f.key!] = n; changed(); }));
          continue;
        }
        let el: HTMLInputElement | HTMLTextAreaElement;
        if (f.type === 'area') { el = h('textarea', { rows: '2', placeholder: f.placeholder, 'aria-label': f.placeholder }) as HTMLTextAreaElement; el.value = value ?? ''; fields.append(el); }
        else {
          el = f.short
            ? (h('input', { placeholder: f.placeholder, 'aria-label': f.placeholder, class: 'short', inputmode: f.type === 'money' ? 'decimal' : undefined }) as HTMLInputElement)
            : (h('textarea', { rows: '1', class: 'grow', placeholder: f.placeholder, 'aria-label': f.placeholder }) as HTMLTextAreaElement);
          el.value = f.type === 'money' ? (value ? Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '') : value ?? '';
          line.append(el);
        }
        el.addEventListener('input', () => {
          if (el instanceof HTMLTextAreaElement) autoGrow(el);
          let v: any = el.value;
          if (f.type === 'money') { const n = parseFloat(v.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')); v = Number.isFinite(n) ? n : 0; }
          if (f.key) arr[i][f.key] = v; else arr[i] = v;
          changed();
        });
      }
      const row = h('div', { class: 'ad-row' });
      const handle = h('button', { type: 'button', class: 'ad-handle', title: 'Arraste para reordenar', 'aria-label': `Reordenar item ${i + 1} (use ↑ e ↓)` }, '⠿');
      const del = h('button', { type: 'button', class: 'ad-del-item', title: 'Remover', 'aria-label': 'Remover item' }, '✕');
      del.addEventListener('click', () => { arr.splice(i, 1); renderList(path); if (path === 'objetivos') renderSuggestions(); changed(); });
      if (arr.length > 1) makeDraggable(handle, row, wrap, arr, path, i); else handle.setAttribute('disabled', '');
      row.append(handle, fields, del);
      requestAnimationFrame(() => fields.querySelectorAll<HTMLTextAreaElement>('textarea').forEach(autoGrow));
      return row;
    }),
  );
  if (path === 'cronograma') updateTotalDias();
}

function updateTotalDias() {
  const total = current ? totalDias(current) : 0;
  $('total-dias').textContent = current?.cronograma.length ? `Prazo total: ${diasTxt(total)}` : '';
}

form.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((b) =>
  b.addEventListener('click', () => {
    const path = b.dataset.add!;
    getPath(current, path).push(LISTS[path].blank());
    renderList(path);
    const rows = form.querySelectorAll(`[data-list="${path}"] .ad-row`);
    (rows[rows.length - 1]?.querySelector('input, textarea') as HTMLElement | null)?.focus();
    changed();
  }),
);

/* ---------- Produtos ---------- */
const DEFAULT_TITLES = ['', 'Proposta', 'Proposta comercial', 'Proposta de projeto'];
const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

function addProduct(prod: Produto) {
  const p = current!;
  p.produtos.push(prod.id);
  for (const o of prod.objetivos) if (!p.objetivos.some((x) => same(x, o))) p.objetivos.push(o);
  for (const e of prod.escopo) if (!p.escopo.some((x) => same(x.titulo, e.titulo))) p.escopo.push({ ...e });
  for (const c of prod.cronograma) if (!p.cronograma.some((x) => same(x.titulo, c.titulo))) p.cronograma.push({ ...c });
  for (const v of prod.investimento) if (!p.investimento.itens.some((x) => same(x.descricao, v.descricao))) p.investimento.itens.push({ ...v });
  if (prod.observacao && !p.investimento.observacao.trim()) p.investimento.observacao = prod.observacao;
  if (DEFAULT_TITLES.includes(p.titulo.trim())) p.titulo = prod.titulo;
  if (!p.subtitulo.trim()) p.subtitulo = prod.subtitulo;
}

/** Ao desmarcar, remove só o que veio do produto e não foi alterado (valores preenchidos ficam). */
function removeProduct(prod: Produto) {
  const p = current!;
  p.produtos = p.produtos.filter((x) => x !== prod.id);
  const others = PRODUTOS.filter((x) => p.produtos.includes(x.id));
  const usedElsewhere = (fn: (o: Produto) => boolean) => others.some(fn);
  p.objetivos = p.objetivos.filter((o) => !prod.objetivos.concat(prod.sugestoes).some((x) => same(x, o)) || usedElsewhere((op) => op.objetivos.some((x) => same(x, o))));
  p.escopo = p.escopo.filter((e) => !prod.escopo.some((x) => same(x.titulo, e.titulo) && same(x.descricao, e.descricao)));
  p.cronograma = p.cronograma.filter((c) => !prod.cronograma.some((x) => same(x.titulo, c.titulo) && x.dias === c.dias));
  p.investimento.itens = p.investimento.itens.filter((v) => v.valor > 0 || !prod.investimento.some((x) => same(x.descricao, v.descricao)));
  if (prod.observacao && same(p.investimento.observacao, prod.observacao)) p.investimento.observacao = others.find((o) => o.observacao)?.observacao ?? '';
  if (same(p.titulo, prod.titulo)) p.titulo = others[0]?.titulo ?? 'Proposta comercial';
  if (same(p.subtitulo, prod.subtitulo)) p.subtitulo = others[0]?.subtitulo ?? '';
}

function renderProducts() {
  $('products').replaceChildren(
    ...PRODUTOS.map((prod) => {
      const on = current!.produtos.includes(prod.id);
      const b = h('button', { type: 'button', class: 'ad-chip', 'aria-pressed': String(on) }, prod.nome);
      b.addEventListener('click', () => {
        if (on) removeProduct(prod); else addProduct(prod);
        fillForm();
        changed();
      });
      return b;
    }),
  );
}

function renderSuggestions() {
  const p = current!;
  const pool = PRODUTOS.filter((x) => p.produtos.includes(x.id)).flatMap((x) => [...x.objetivos, ...x.sugestoes]);
  const free = [...new Set(pool)].filter((o) => !p.objetivos.some((x) => same(x, o)));
  $('suggestions').replaceChildren(
    ...free.map((o) => {
      const b = h('button', { type: 'button', title: 'Incluir objetivo' }, `+ ${o}`);
      b.addEventListener('click', () => { p.objetivos.push(o); renderList('objetivos'); renderSuggestions(); changed(); });
      return b;
    }),
  );
}

/* ---------- Campos simples ---------- */
form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-path]').forEach((el) => {
  el.addEventListener('input', () => {
    const path = el.dataset.path!;
    let v: any = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.value;
    if (el instanceof HTMLInputElement && el.type === 'number') v = Number(v) || 0;
    if (el.dataset.mask === 'phone') v = waNumber(String(v));
    setPath(current, path, v);
    changed();
  });
  if (el.dataset.mask === 'phone') el.addEventListener('blur', () => { el.value = fmtPhone(getPath(current, el.dataset.path!) ?? ''); });
});

$('f-status').addEventListener('change', (e) => {
  if (!current) return;
  current.status = (e.target as HTMLSelectElement).value as Proposta['status'];
  changed();
});

function fillForm() {
  if (!current) return;
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-path]').forEach((el) => {
    const v = getPath(current, el.dataset.path!);
    if (el instanceof HTMLInputElement && el.type === 'checkbox') el.checked = !!v;
    else el.value = el.dataset.mask === 'phone' ? fmtPhone(v ?? '') : v ?? '';
  });
  const status = $<HTMLSelectElement>('f-status');
  status.value = current.status;
  status.disabled = !!current.aceite;
  Object.keys(LISTS).forEach(renderList);
  renderProducts();
  renderSuggestions();
  const v = current.visualizacoes;
  $('views-info').textContent = current.aceite
    ? `✓ Aceita por ${current.aceite.nome} em ${fmtDate(current.aceite.em)}.`
    : v?.total ? `O cliente abriu esta proposta ${v.total}× (última em ${fmtDate(v.ultima!)}).` : current.status === 'rascunho' ? 'Rascunho: ao enviar, a proposta passa para “Enviada” e o link abre para o cliente.' : 'Enviada. O cliente ainda não abriu o link.';
  ($('open-client') as HTMLAnchorElement).href = `/p/${current.id}`;
}

function drawPreview() {
  if (!current) return;
  const scroll = preview.scrollTop;
  preview.replaceChildren(renderProposta(current, { interativo: false }));
  preview.scrollTop = scroll;
  const total = current.investimento.itens.reduce((s, i) => s + (i.valor || 0), 0);
  $('total').textContent = current.investimento.itens.length ? `Total: ${brl(total)}` : '';
  updateTotalDias();
}

function setSaveState() {
  saveBtn.classList.toggle('is-dirty', dirty);
  saveBtn.classList.toggle('is-saved', !dirty);
  saveBtn.textContent = dirty ? 'Salvar' : 'Salvo ✓';
  if (dirty) { saveState.classList.remove('is-err'); saveState.textContent = 'Alterações não salvas'; }
}

function changed() {
  dirty = true;
  drawPreview();
  setSaveState();
  // Cópia de segurança local (não vai para o cliente até salvar).
  try { localStorage.setItem(backupKey(current!.id), JSON.stringify({ at: Date.now(), data: current })); } catch {}
}

async function save() {
  if (!current) return;
  if (saving) return saving;
  const id = current.id;
  const snapshot = JSON.stringify(current);
  saveBtn.disabled = true;
  saveState.textContent = 'Salvando…';
  saving = (async () => {
    try {
      const saved = await api<Prop>(`/api/admin/propostas/${id}`, { method: 'PUT', body: snapshot });
      if (current?.id !== id) return;
      if (JSON.stringify(current) === snapshot) { dirty = false; try { localStorage.removeItem(backupKey(id)); } catch {} }
      if (saved.aceite && !current.aceite) { current.aceite = saved.aceite; current.status = 'aceita'; fillForm(); drawPreview(); }
      current.atualizadaEm = saved.atualizadaEm;
      saveState.textContent = `Salvo às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${current.status === 'rascunho' ? '' : ' · o cliente já vê'}`;
      showToast(current.status === 'rascunho' ? 'Proposta salva' : 'Salvo: o cliente já vê a nova versão');
    } catch (e) {
      if ((e as Error).message !== 'unauthorized') { saveState.textContent = 'Erro ao salvar. Tente de novo.'; saveState.classList.add('is-err'); }
    } finally {
      saving = null;
      saveBtn.disabled = false;
      setSaveState();
    }
  })();
  return saving;
}

saveBtn.addEventListener('click', () => save());
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's' && !views.editor.hidden) { e.preventDefault(); save(); }
});

async function openEditor(id: string) {
  show('editor');
  saveState.textContent = '';
  dirty = false;
  preview.replaceChildren(h('p', { class: 'pp-empty' }, 'Carregando…'));
  try { current = await api(`/api/admin/propostas/${id}`); }
  catch (e) { if ((e as Error).message !== 'unauthorized') { showToast('Proposta não encontrada'); go(null, true); } return; }
  // Recupera alterações não salvas deste navegador, se houver.
  try {
    const raw = localStorage.getItem(backupKey(id));
    if (raw) {
      const b = JSON.parse(raw);
      if (b.at > Date.parse(current!.atualizadaEm) && confirm('Encontramos alterações desta proposta que não foram salvas. Recuperar?')) {
        current = { ...b.data, aceite: current!.aceite, visualizacoes: current!.visualizacoes };
        dirty = true;
      } else localStorage.removeItem(backupKey(id));
    }
  } catch {}
  fillForm();
  drawPreview();
  setSaveState();
}

$('duplicate').addEventListener('click', async () => {
  if (!current) return;
  if (dirty) await save();
  duplicate(current.id);
});
$('delete').addEventListener('click', async () => {
  if (!current || !confirm(`Apagar a proposta "${current.titulo}"? O link do cliente deixará de funcionar. Isso não pode ser desfeito.`)) return;
  await api(`/api/admin/propostas/${current.id}`, { method: 'DELETE' });
  try { localStorage.removeItem(backupKey(current.id)); } catch {}
  dirty = false;
  showToast('Proposta apagada');
  go(null);
});

// Abas Editar/Prévia no celular
const editorEl = views.editor;
editorEl.dataset.tab = 'form';
editorEl.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) =>
  b.addEventListener('click', () => {
    editorEl.dataset.tab = b.dataset.tab!;
    editorEl.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  }),
);

window.addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });

/* ================= ROTAS ================= */
async function go(id: string | null, force = false) {
  if (current && dirty && !force) {
    if (!confirm('Há alterações não salvas. OK para salvar e sair, ou Cancelar para continuar editando.')) return;
    await save();
    if (dirty) return;
  }
  history.pushState(null, '', id ? `/propostas/?id=${id}` : '/propostas/');
  route();
}
document.querySelectorAll<HTMLElement>('[data-nav="list"]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); go(null); }));
window.addEventListener('popstate', route);

async function route() {
  const me = await fetch('/api/auth/me', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ authenticated: false, configured: true }));
  if (!me.authenticated) {
    show('login');
    if (!me.configured) $('login-msg').textContent = 'Login ainda não configurado: cadastre PROPOSTAS_USUARIO e PROPOSTAS_SENHA nas variáveis do Netlify.';
    return;
  }
  const id = new URLSearchParams(location.search).get('id');
  if (id) openEditor(id);
  else { current = null; dirty = false; loadList().catch(() => {}); }
}
route();
