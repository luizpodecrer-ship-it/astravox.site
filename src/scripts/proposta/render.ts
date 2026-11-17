// Renderiza uma proposta em HTML seguro (todo texto entra via textContent, nunca innerHTML).
// Usado pela página do cliente (/p/:id) e pela prévia ao vivo do editor.
import { SYMBOL_PATH } from '../../data/logo';

export type Proposta = {
  id: string;
  status: 'rascunho' | 'enviada' | 'aceita' | 'recusada';
  cliente: { nome: string; empresa: string };
  titulo: string;
  subtitulo: string;
  data: string;
  validadeDias: number;
  introducao: string;
  objetivos: string[];
  escopo: { titulo: string; descricao: string }[];
  cronograma: { titulo: string; dias: number }[];
  investimento: { itens: { descricao: string; valor: number }[]; observacao: string; mostrarTotal: boolean };
  pagamento: string;
  proximosPassos: string;
  responsavel: { nome: string; whatsapp: string };
  aceite?: { nome: string; em: string } | null;
  atualizadaEm: string;
  notasInternas?: string;
};

export const diasTxt = (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`;
export const totalDias = (p: Pick<Proposta, 'cronograma'>) => p.cronograma.reduce((s, e) => s + (e.dias || 0), 0);
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataBR = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return y ? new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
};
export const validade = (p: Proposta) => {
  if (!p.validadeDias) return null;
  const [y, m, d] = p.data.split('-').map(Number);
  const dt = new Date(y, m - 1, d + p.validadeDias);
  return { data: dt, vencida: dt.getTime() < new Date().setHours(0, 0, 0, 0) };
};

type Child = Node | string | null | undefined | false;
export function h(tag: string, attrs: Record<string, string | undefined> = {}, ...children: (Child | Child[])[]) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) el.setAttribute(k, v);
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return el;
}

/** Texto livre → parágrafos (linha em branco) e quebras de linha simples. */
function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const p = h('p');
      block.split('\n').forEach((line, i) => { if (i) p.append(h('br')); p.append(line); });
      return p;
    });
}

function logoSymbol() {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 166 200');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('fill', '#D1FF2B');
  path.setAttribute('fill-rule', 'evenodd');
  path.setAttribute('d', SYMBOL_PATH);
  svg.append(path);
  return svg;
}

/** Seções da proposta, na ordem em que o cliente vê. Seção vazia não aparece e não recebe número. */
export type SecKey = 'intro' | 'objetivos' | 'escopo' | 'cronograma' | 'investimento' | 'pagamento' | 'proximos';
export const SECOES: { key: SecKey; titulo: string; preenchida: (p: Proposta) => boolean }[] = [
  { key: 'intro', titulo: 'Introdução', preenchida: (p) => !!p.introducao.trim() },
  { key: 'objetivos', titulo: 'Objetivos', preenchida: (p) => p.objetivos.some((o) => o.trim()) },
  { key: 'escopo', titulo: 'Escopo', preenchida: (p) => p.escopo.some((e) => e.titulo.trim() || e.descricao.trim()) },
  { key: 'cronograma', titulo: 'Cronograma', preenchida: (p) => p.cronograma.some((e) => e.titulo.trim() || e.dias) },
  { key: 'investimento', titulo: 'Investimento', preenchida: (p) => p.investimento.itens.some((i) => i.descricao.trim() || i.valor) || !!p.investimento.observacao.trim() },
  { key: 'pagamento', titulo: 'Condições de pagamento', preenchida: (p) => !!p.pagamento.trim() },
  { key: 'proximos', titulo: 'Próximos passos', preenchida: (p) => !!p.proximosPassos.trim() },
];
/** Número de cada seção como aparece na proposta (null = vazia, não aparece). */
export function numeracao(p: Proposta): Record<SecKey, number | null> {
  let n = 0;
  return Object.fromEntries(SECOES.map((s) => [s.key, s.preenchida(p) ? ++n : null])) as Record<SecKey, number | null>;
}

export type RenderOptions = {
  /** Mostra os botões de aceite (página do cliente). */
  interativo?: boolean;
  onAceitar?: (nome: string) => Promise<void>;
};

export function renderProposta(p: Proposta, opts: RenderOptions = {}) {
  const root = h('article', { class: 'pp' });
  const val = validade(p);
  const cliente = [p.cliente.nome, p.cliente.empresa].filter(Boolean).join(' · ');

  // ---------- Capa ----------
  const logo = h('span', { class: 'pp-logo' });
  logo.append(logoSymbol());
  logo.append(h('b', {}, 'astravox'));
  const meta = h('dl', { class: 'pp-meta' },
    cliente ? h('div', {}, h('dt', {}, 'Para'), h('dd', {}, cliente)) : null,
    h('div', {}, h('dt', {}, 'Data'), h('dd', {}, dataBR(p.data))),
    val ? h('div', {}, h('dt', {}, 'Válida até'), h('dd', { class: val.vencida ? 'is-late' : undefined }, val.data.toLocaleDateString('pt-BR') + (val.vencida ? ' (vencida)' : ''))) : null,
  );
  root.append(
    h('header', { class: 'pp-cover' },
      h('div', { class: 'pp-cover__glow', 'aria-hidden': 'true' }),
      h('div', { class: 'pp-cover__top' }, logo, h('span', { class: 'pp-tag' }, p.aceite ? 'Proposta aceita' : 'Proposta comercial')),
      h('h1', {}, p.titulo || 'Proposta'),
      p.subtitulo ? h('p', { class: 'pp-sub' }, p.subtitulo) : null,
      meta,
    ),
  );

  // ---------- Seções (numeradas só as que têm conteúdo; mesma regra do formulário) ----------
  const sections: [SecKey, string, Node][] = [];
  const push = (key: SecKey, body: Node) => sections.push([key, SECOES.find((x) => x.key === key)!.titulo, body]);
  if (p.introducao.trim()) push('intro', h('div', { class: 'pp-text' }, paragraphs(p.introducao)));
  const objetivos = p.objetivos.filter((o) => o.trim());
  if (objetivos.length) push('objetivos', h('ul', { class: 'pp-checks' }, objetivos.map((o) => h('li', {}, h('span', { class: 'pp-check', 'aria-hidden': 'true' }, '✓'), o))));
  const escopo = p.escopo.filter((e) => e.titulo.trim() || e.descricao.trim());
  if (escopo.length) push('escopo', h('div', { class: 'pp-cards' }, escopo.map((e, i) => h('div', { class: 'pp-card' }, h('span', { class: 'pp-n' }, String(i + 1).padStart(2, '0')), h('h3', {}, e.titulo), e.descricao ? h('div', { class: 'pp-text' }, paragraphs(e.descricao)) : null))));
  const etapas = p.cronograma.filter((e) => e.titulo.trim() || e.dias);
  if (etapas.length) {
    const total = totalDias({ cronograma: etapas });
    push('cronograma', h('div', {},
      h('ol', { class: 'pp-timeline' }, etapas.map((e) => h('li', {}, h('span', { class: 'pp-dot', 'aria-hidden': 'true' }), h('strong', {}, e.titulo), e.dias ? h('span', { class: 'pp-prazo' }, diasTxt(e.dias)) : null))),
      total ? h('p', { class: 'pp-total-time' }, h('span', {}, 'Prazo total estimado'), h('strong', {}, diasTxt(total))) : null,
    ));
  }
  const itens = p.investimento.itens.filter((i) => i.descricao.trim() || i.valor);
  if (itens.length || p.investimento.observacao.trim()) {
    const total = itens.reduce((s, i) => s + (i.valor || 0), 0);
    const table = itens.length
      ? h('table', { class: 'pp-table' },
          h('tbody', {}, itens.map((i) => h('tr', {}, h('td', {}, i.descricao), h('td', {}, i.valor ? brl(i.valor) : '—')))),
          p.investimento.mostrarTotal && itens.length > 0 ? h('tfoot', {}, h('tr', {}, h('td', {}, 'Total'), h('td', {}, h('span', { class: 'pp-total' }, brl(total))))) : null,
        )
      : null;
    push('investimento', h('div', {}, table, p.investimento.observacao.trim() ? h('div', { class: 'pp-text pp-note' }, paragraphs(p.investimento.observacao)) : null));
  }
  if (p.pagamento.trim()) push('pagamento', h('div', { class: 'pp-text' }, paragraphs(p.pagamento)));
  if (p.proximosPassos.trim()) push('proximos', h('div', { class: 'pp-text' }, paragraphs(p.proximosPassos)));

  sections.forEach(([key, title, body], i) => {
    root.append(h('section', { class: 'pp-section', 'data-sec': key }, h('div', { class: 'pp-section__head' }, h('span', { class: 'pp-n' }, String(i + 1).padStart(2, '0')), h('h2', {}, title)), body));
  });
  if (!sections.length) root.append(h('p', { class: 'pp-empty' }, 'Comece a preencher a proposta no editor ao lado.'));

  // ---------- Aceite ----------
  const wa = p.responsavel.whatsapp.replace(/\D/g, '');
  const wame = (msg: string) => (wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : '');
  // Mensagem muda conforme o momento: dúvida antes de aprovar, confirmação depois.
  const waDuvida = wame(`Olá! Estou vendo a proposta "${p.titulo}" e tenho uma dúvida.`);
  const empresa = p.cliente.empresa ? ` da ${p.cliente.empresa}` : '';
  const waAprovada = p.aceite
    ? wame(`Olá! Aqui é ${p.aceite.nome}${empresa}. Acabei de aprovar a proposta "${p.titulo}". Vamos definir os próximos passos?`)
    : '';
  const waLink = waDuvida;
  const footer = h('footer', { class: 'pp-accept' });
  // append() escreveria "null" na tela: filtra os itens vazios.
  const add = (...nodes: (Node | null)[]) => footer.append(...nodes.filter((n): n is Node => n !== null));
  if (p.aceite) {
    add(
      h('div', { class: 'pp-accepted' }, h('span', { class: 'pp-check pp-check--big', 'aria-hidden': 'true' }, '✓'),
        h('div', {}, h('strong', {}, 'Proposta aceita'), h('p', {}, `por ${p.aceite.nome} em ${new Date(p.aceite.em).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}`))),
      waAprovada
        ? h('div', { class: 'pp-next' },
            h('p', {}, 'Avise a Astravox para combinarmos os próximos passos:'),
            h('a', { class: 'pp-btn', href: waAprovada, target: '_blank', rel: 'noopener' }, 'Avisar a Astravox no WhatsApp'))
        : null,
    );
  } else if (p.status === 'recusada') {
    add(h('p', { class: 'pp-closed' }, 'Esta proposta foi encerrada. Fale com a Astravox para uma nova versão.'), waLink ? h('a', { class: 'pp-btn pp-btn--ghost', href: waLink, target: '_blank', rel: 'noopener' }, 'WhatsApp') : null);
  } else {
    const form = h('form', { class: 'pp-form' }) as HTMLFormElement;
    const input = h('input', { type: 'text', name: 'nome', placeholder: 'Seu nome completo', required: '', minlength: '2', 'aria-label': 'Seu nome completo', autocomplete: 'name' }) as HTMLInputElement;
    const btn = h('button', { class: 'pp-btn', type: 'submit' }, 'Aceitar proposta') as HTMLButtonElement;
    const msg = h('p', { class: 'pp-form__msg', role: 'status' });
    form.append(input, btn, msg);
    if (!opts.interativo) { input.disabled = true; btn.disabled = true; btn.title = 'Disponível na página do cliente'; }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!opts.onAceitar || !form.reportValidity()) return;
      if (!confirm(`Confirmar o aceite da proposta "${p.titulo}" em nome de ${input.value.trim()}?`)) return;
      btn.disabled = true; btn.textContent = 'Registrando…';
      try { await opts.onAceitar(input.value.trim()); }
      catch { btn.disabled = false; btn.textContent = 'Aceitar proposta'; msg.textContent = 'Não foi possível registrar agora. Tente de novo ou fale conosco no WhatsApp.'; }
    });
    add(
      h('div', {}, h('h2', {}, 'Vamos começar?'), h('p', {}, 'Para aprovar, digite seu nome e clique em aceitar. Ficamos com o registro e entramos em contato para o kickoff.')),
      form,
      waLink ? h('a', { class: 'pp-btn pp-btn--ghost', href: waLink, target: '_blank', rel: 'noopener' }, 'Tirar dúvidas no WhatsApp') : null,
    );
  }
  root.append(footer);
  root.append(h('p', { class: 'pp-sign' }, `${p.responsavel.nome || 'Astravox'} · astravox.com.br`));
  return root;
}
