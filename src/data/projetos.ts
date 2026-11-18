/**
 * Projetos exibidos em /projetos/. Só entram trabalhos reais.
 * Lista vazia = a página mostra "em breve" e fica fora do Google.
 *
 * Exemplo de preenchimento:
 * { segs: ['sites'], titulo: 'Novo site institucional', cliente: 'Empresa X', ano: '2026',
 *   texto: 'Site rápido e preparado para o Google.', entregas: ['Design', 'Desenvolvimento', 'SEO'],
 *   url: 'https://empresax.com.br', imagem: '/projetos/empresa-x.jpg', kind: 'site', hue: 72 }
 * imagem: print do projeto em /public/projetos/ (proporção 4:3). Sem imagem, usa a ilustração (kind/hue).
 */
export type Projeto = {
  /** Segmentos em que o projeto aparece; o primeiro é o principal (etiqueta do cartão). */
  segs: string[];
  titulo: string;
  cliente: string;
  ano?: string;
  texto: string;
  entregas: string[];
  url?: string;
  imagem?: string;
  kind?: 'site' | 'dash' | 'phone' | 'chat' | 'ux' | 'brand';
  hue?: number;
};

export const SEGMENTOS = [
  { id: 'sites', nome: 'Sites' },
  { id: 'sistemas', nome: 'Sistemas' },
  { id: 'apps', nome: 'Aplicativos' },
  { id: 'portais', nome: 'Portais e blogs' },
  { id: 'ia', nome: 'IA e automação' },
];

export const PROJETOS: Projeto[] = [
  {
    segs: ['sites'], titulo: 'Head 14', cliente: 'Head 14 · Cuiabá/MT',
    texto: 'Site institucional da empresa de Business & Marketing: vendas de mídia em rádio, OOH, DOOH e mídias sociais, e consultoria para veículos de comunicação.',
    entregas: ['Site institucional', 'Blog', 'SEO'], url: 'https://www.head14.com.br', imagem: '/projetos/head-14.webp',
  },
  {
    segs: ['sistemas', 'sites'], titulo: 'SONVI', cliente: '',
    texto: 'Sistema de gestão comercial para rádios e mídia exterior: proposta, pedido de inserção (PI), OPEC, vendas, comissões e metas em um só lugar, na nuvem.',
    entregas: ['Sistema web', 'Site do produto', 'Resumo no WhatsApp'], url: 'https://www.sonvi.com.br', imagem: '/projetos/sonvi.webp',
  },
  {
    segs: ['sites'], titulo: 'IA Conference 2027', cliente: 'IA Conference · Cuiabá/MT',
    texto: 'Site do evento de inteligência artificial para empresas em Cuiabá, com programação, palestrantes, local e lista de interessados.',
    entregas: ['Site de evento', 'Captação de inscritos', 'SEO'], url: 'https://www.iaconference.com.br', imagem: '/projetos/ia-conference.webp',
  },
  {
    segs: ['sistemas', 'sites'], titulo: 'StayOne', cliente: '',
    texto: 'Sistema de gestão de espaços e eventos para hotéis: propostas, contratos, agenda, grupos e financeiro, do primeiro contato à última assinatura.',
    entregas: ['Sistema web', 'Site do produto'], url: 'https://www.stayone.com.br', imagem: '/projetos/stayone.webp',
  },
  {
    segs: ['sites'], titulo: 'IMPACTO Mídia Exterior', cliente: 'IMPACTO · Cuiabá e Várzea Grande',
    texto: 'Site da empresa de mídia exterior, com os formatos (front light e empenas), os pontos disponíveis e o mapa dos pontos.',
    entregas: ['Site institucional', 'Mapa dos pontos', 'SEO'], url: 'https://www.impactomidiaexterior.com.br', imagem: '/projetos/impacto-midia-exterior.webp',
  },
  {
    segs: ['sistemas', 'sites'], titulo: 'Jogo Feito', cliente: '',
    texto: 'Gestão para futebol amador: elenco, convocação pelo WhatsApp, caixa do time e campeonatos.',
    entregas: ['Sistema web', 'Convocação pelo WhatsApp'], url: 'https://www.jogofeito.com.br', imagem: '/projetos/jogo-feito.webp',
  },
];
