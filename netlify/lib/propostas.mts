// Modelo de dados e armazenamento das propostas (Netlify Blobs, store "propostas").
// Leituras usam consistência forte para o cliente ver as edições em segundos.
import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';

export type Item = { titulo: string; descricao: string };
export type Etapa = { titulo: string; prazo: string };
export type Valor = { descricao: string; valor: number };

export type Proposta = {
  id: string;
  status: 'rascunho' | 'enviada' | 'aceita' | 'recusada';
  cliente: { nome: string; empresa: string };
  titulo: string;
  subtitulo: string;
  data: string; // AAAA-MM-DD
  validadeDias: number;
  introducao: string;
  objetivos: string[];
  escopo: Item[];
  cronograma: Etapa[];
  investimento: { itens: Valor[]; observacao: string; mostrarTotal: boolean };
  pagamento: string;
  proximosPassos: string;
  responsavel: { nome: string; whatsapp: string };
  notasInternas: string; // nunca vai para o cliente
  aceite?: { nome: string; em: string } | null;
  criadaEm: string;
  atualizadaEm: string;
};

export const store = () => getStore({ name: 'propostas', consistency: 'strong' });
export const viewsStore = () => getStore({ name: 'propostas-visualizacoes', consistency: 'strong' });

export const newId = () => randomBytes(12).toString('base64url'); // 16 caracteres, ~96 bits
export const validId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{16}$/.test(id);

const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
};
const list = <T,>(v: unknown, fn: (x: any) => T, max = 40): T[] => (Array.isArray(v) ? v.slice(0, max).map(fn) : []);

/** Aceita só os campos conhecidos, com tipos e tamanhos limitados. */
export function sanitize(input: any, base: Proposta): Proposta {
  const status = ['rascunho', 'enviada', 'aceita', 'recusada'].includes(input?.status) ? input.status : base.status;
  return {
    ...base,
    status,
    cliente: { nome: str(input?.cliente?.nome, 120), empresa: str(input?.cliente?.empresa, 120) },
    titulo: str(input?.titulo, 160),
    subtitulo: str(input?.subtitulo, 300),
    data: /^\d{4}-\d{2}-\d{2}$/.test(input?.data) ? input.data : base.data,
    validadeDias: Math.max(0, Math.min(365, Math.round(num(input?.validadeDias)))),
    introducao: str(input?.introducao),
    objetivos: list(input?.objetivos, (x) => str(x, 300)),
    escopo: list(input?.escopo, (x) => ({ titulo: str(x?.titulo, 160), descricao: str(x?.descricao, 2000) })),
    cronograma: list(input?.cronograma, (x) => ({ titulo: str(x?.titulo, 160), prazo: str(x?.prazo, 80) })),
    investimento: {
      itens: list(input?.investimento?.itens, (x) => ({ descricao: str(x?.descricao, 200), valor: num(x?.valor) })),
      observacao: str(input?.investimento?.observacao, 1000),
      mostrarTotal: input?.investimento?.mostrarTotal !== false,
    },
    pagamento: str(input?.pagamento, 2000),
    proximosPassos: str(input?.proximosPassos, 2000),
    responsavel: { nome: str(input?.responsavel?.nome, 120), whatsapp: str(input?.responsavel?.whatsapp, 20).replace(/\D/g, '') },
    notasInternas: str(input?.notasInternas, 5000),
    atualizadaEm: new Date().toISOString(),
  };
}

export function blank(): Proposta {
  const now = new Date();
  return {
    id: newId(),
    status: 'rascunho',
    cliente: { nome: '', empresa: '' },
    titulo: 'Proposta de projeto',
    subtitulo: '',
    data: now.toISOString().slice(0, 10),
    validadeDias: 15,
    introducao: '',
    objetivos: [],
    escopo: [],
    cronograma: [],
    investimento: { itens: [], observacao: '', mostrarTotal: true },
    pagamento: '',
    proximosPassos: 'Aprovando esta proposta, agendamos a reunião de kickoff e iniciamos a primeira etapa.',
    responsavel: { nome: 'Astravox', whatsapp: '5565998113738' },
    notasInternas: '',
    aceite: null,
    criadaEm: now.toISOString(),
    atualizadaEm: now.toISOString(),
  };
}

/** Versão pública: sem notas internas. */
export function publicView(p: Proposta) {
  const { notasInternas, ...rest } = p;
  return rest;
}
