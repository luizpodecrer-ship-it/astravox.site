// Painel de propostas: login, lista e editor com salvamento automático e prévia ao vivo.
import { renderProposta, brl, h, type Proposta } from './render';

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

async function copyLink(id: string, status: Proposta['status']) {
  if (status === 'rascunho') {
    if (!confirm('Esta proposta ainda é um rascunho e o cliente não consegue abrir. Marcar como “Enviada” e copiar o link?')) return;
    if (current?.id === id) { current.status = 'enviada'; ($('f-status') as HTMLSelectElement).value = 'enviada'; await saveNow(); }
    else {
      const p = await api<Proposta>(`/api/admin/propostas/${id}`);
      await api(`/api/admin/propostas/${id}`, { method: 'PUT', body: JSON.stringify({ ...p, status: 'enviada' }) });
    }
  }
  try { await navigator.clipboard.writeText(clientUrl(id)); showToast('Link copiado: cole no WhatsApp ou e-mail do cliente'); }
  catch { prompt('Copie o link do cliente:', clientUrl(id)); }
  if (!current) loadList();
}

/* ================= EDITOR ================= */
let current: (Proposta & { visualizacoes?: Resumo['visualizacoes'] }) | null = null;
let saveTimer: number | undefined;
let saving = Promise.resolve();
const form = $<HTMLFormElement>('editor-form');
const preview = $('preview');

const getPath = (obj: any, path: string) => path.split('.').reduce((o, k) => o?.[k], obj);
function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.');
  const last = keys.pop()!;
  keys.reduce((o, k) => o[k], obj)[last] = value;
}

type ListDef = { blank: () => any; fields: { key?: string; placeholder: string; type?: 'text' | 'area' | 'money' }[] };
const LISTS: Record<string, ListDef> = {
  objetivos: { blank: () => '', fields: [{ placeholder: 'Ex.: Gerar mais contatos pelo Google' }] },
  escopo: { blank: () => ({ titulo: '', descricao: '' }), fields: [{ key: 'titulo', placeholder: 'Título do item' }, { key: 'descricao', placeholder: 'Descrição (opcional)', type: 'area' }] },
  cronograma: { blank: () => ({ titulo: '', prazo: '' }), fields: [{ key: 'titulo', placeholder: 'Etapa' }, { key: 'prazo', placeholder: 'Prazo (ex.: Semana 1–2)' }] },
  'investimento.itens': { blank: () => ({ descricao: '', valor: 0 }), fields: [{ key: 'descricao', placeholder: 'Descrição' }, { key: 'valor', placeholder: 'R$ 0,00', type: 'money' }] },
};

function renderList(path: string) {
  const def = LISTS[path];
  const arr: any[] = getPath(current, path);
  const wrap = form.querySelector(`[data-list="${path}"]`)!;
  wrap.replaceChildren(
    ...arr.map((item, i) => {
      const line = h('div', { class: 'ad-row__line' });
      const extra: HTMLElement[] = [];
      for (const f of def.fields) {
        const value = f.key ? item[f.key] : item;
        let el: HTMLInputElement | HTMLTextAreaElement;
        if (f.type === 'area') { el = h('textarea', { rows: '2', placeholder: f.placeholder }) as HTMLTextAreaElement; el.value = value ?? ''; }
        else if (f.type === 'money') { el = h('input', { class: 'money', inputmode: 'decimal', placeholder: f.placeholder }) as HTMLInputElement; el.value = value ? String(value).replace('.', ',') : ''; }
        else { el = h('input', { placeholder: f.placeholder }) as HTMLInputElement; el.value = value ?? ''; }
        el.addEventListener('input', () => {
          let v: any = el.value;
          if (f.type === 'money') { const n = parseFloat(v.replace(/\./g, '').replace(',', '.')); v = Number.isFinite(n) ? n : 0; }
          if (f.key) arr[i][f.key] = v; else arr[i] = v;
          changed();
        });
        if (f.type === 'area') extra.push(el); else line.append(el);
      }
      const tools = h('div', { class: 'ad-row__tools' });
      const mk = (label: string, title: string, fn: () => void) => { const b = h('button', { type: 'button', title, 'aria-label': title }, label); b.addEventListener('click', fn); tools.append(b); };
      mk('↑', 'Mover para cima', () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; renderList(path); changed(); } });
      mk('↓', 'Mover para baixo', () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; renderList(path); changed(); } });
      mk('✕', 'Remover', () => { arr.splice(i, 1); renderList(path); changed(); });
      return h('div', { class: 'ad-row' }, line, ...extra, tools);
    }),
  );
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

form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-path]').forEach((el) =>
  el.addEventListener('input', () => {
    const path = el.dataset.path!;
    let v: any = el instanceof HTMLInputElement && el.type === 'checkbox' ? el.checked : el.value;
    if (el instanceof HTMLInputElement && el.type === 'number') v = Number(v) || 0;
    if (path === 'responsavel.whatsapp') v = String(v).replace(/\D/g, '');
    setPath(current, path, v);
    changed();
  }),
);

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
    else el.value = v ?? '';
  });
  const status = $<HTMLSelectElement>('f-status');
  status.value = current.status;
  status.disabled = !!current.aceite;
  Object.keys(LISTS).forEach(renderList);
  const v = current.visualizacoes;
  $('views-info').textContent = current.aceite
    ? `✓ Aceita por ${current.aceite.nome} em ${fmtDate(current.aceite.em)}.`
    : v?.total ? `O cliente abriu esta proposta ${v.total}× (última em ${fmtDate(v.ultima!)}).` : current.status === 'rascunho' ? 'Rascunho: o link só abre para o cliente depois que o status for “Enviada”.' : 'O cliente ainda não abriu o link.';
  updateLinks();
}

function updateLinks() {
  if (!current) return;
  ($('open-client') as HTMLAnchorElement).href = `/p/${current.id}`;
  const nome = current.cliente.nome.split(' ')[0];
  const msg = `Olá${nome ? `, ${nome}` : ''}! Segue a proposta da Astravox: ${clientUrl(current.id)}\nVocê pode ver e aprovar por esse link. Qualquer dúvida, é só chamar aqui.`;
  ($('share-wa') as HTMLAnchorElement).href = `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

function drawPreview() {
  if (!current) return;
  const scroll = preview.scrollTop;
  preview.replaceChildren(renderProposta(current, { interativo: false }));
  preview.scrollTop = scroll;
  const total = current.investimento.itens.reduce((s, i) => s + (i.valor || 0), 0);
  $('total').textContent = current.investimento.itens.length ? `Total: ${brl(total)}` : '';
}

function changed() {
  drawPreview();
  updateLinks();
  saveState.classList.remove('is-err');
  saveState.textContent = 'Alterações não salvas…';
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveNow, 800);
}

function saveNow() {
  clearTimeout(saveTimer);
  if (!current) return Promise.resolve();
  const snapshot = JSON.stringify(current);
  const id = current.id;
  saving = saving.then(async () => {
    saveState.textContent = 'Salvando…';
    try {
      const saved = await api<Proposta>(`/api/admin/propostas/${id}`, { method: 'PUT', body: snapshot });
      if (current?.id === id && saved.aceite && !current.aceite) { current.aceite = saved.aceite; current.status = 'aceita'; fillForm(); drawPreview(); }
      saveState.textContent = `Salvo às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · o cliente já vê`;
    } catch (e) {
      if ((e as Error).message !== 'unauthorized') { saveState.textContent = 'Erro ao salvar. Tentando de novo…'; saveState.classList.add('is-err'); saveTimer = window.setTimeout(saveNow, 4000); }
    }
  });
  return saving;
}

async function openEditor(id: string) {
  show('editor');
  saveState.textContent = '';
  preview.replaceChildren(h('p', { class: 'pp-empty' }, 'Carregando…'));
  try { current = await api(`/api/admin/propostas/${id}`); }
  catch (e) { if ((e as Error).message !== 'unauthorized') { showToast('Proposta não encontrada'); go(null); } return; }
  fillForm();
  drawPreview();
}

$('copy-link').addEventListener('click', () => current && copyLink(current.id, current.status));
$('duplicate').addEventListener('click', async () => { if (current) { await saveNow(); duplicate(current.id); } });
$('delete').addEventListener('click', async () => {
  if (!current || !confirm(`Apagar a proposta "${current.titulo}"? O link do cliente deixará de funcionar. Isso não pode ser desfeito.`)) return;
  await api(`/api/admin/propostas/${current.id}`, { method: 'DELETE' });
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

// Avisa antes de sair com alterações pendentes
window.addEventListener('beforeunload', (e) => { if (saveState.textContent?.startsWith('Alterações')) { saveNow(); e.preventDefault(); } });

/* ================= ROTAS ================= */
async function go(id: string | null) {
  if (current) await saveNow();
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
  else { current = null; loadList().catch(() => {}); }
}
route();
