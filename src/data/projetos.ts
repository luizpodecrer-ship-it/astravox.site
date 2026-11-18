/**
 * Projetos exibidos em /projetos/. Só entram trabalhos reais.
 * Lista vazia = a página mostra "em breve" e fica fora do Google.
 *
 * Exemplo de preenchimento:
 * { seg: 'sites', titulo: 'Novo site institucional', cliente: 'Empresa X', ano: '2026',
 *   texto: 'Site rápido e preparado para o Google.', entregas: ['Design', 'Desenvolvimento', 'SEO'],
 *   url: 'https://empresax.com.br', imagem: '/projetos/empresa-x.jpg', kind: 'site', hue: 72 }
 * imagem: print do projeto em /public/projetos/ (proporção 4:3). Sem imagem, usa a ilustração (kind/hue).
 */
export type Projeto = {
  seg: string;
  titulo: string;
  cliente: string;
  ano: string;
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

export const PROJETOS: Projeto[] = [];
