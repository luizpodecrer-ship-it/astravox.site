/**
 * Catálogo de produtos do editor de propostas.
 * Ao escolher um produto, o editor adiciona estes itens à proposta (todos editáveis).
 * - objetivos: entram marcados; sugestoes: aparecem como "+ chips" para incluir com um clique.
 * - valor do investimento começa em 0: preencha na proposta (não há preço de tabela aqui).
 * - cronograma em dias (úteis); são sugestões, ajuste com − e + em cada proposta.
 */

export type Produto = {
  id: string;
  nome: string;
  titulo: string;
  subtitulo: string;
  objetivos: string[];
  sugestoes: string[];
  escopo: { titulo: string; descricao: string }[];
  cronograma: { titulo: string; dias: number }[];
  investimento: { descricao: string; valor: number }[];
  observacao?: string;
};

const OBS_WEB = 'Valores não incluem hospedagem e anuidade de domínio.';

export const PRODUTOS: Produto[] = [
  {
    id: 'site',
    nome: 'Site institucional',
    titulo: 'Novo site institucional',
    subtitulo: 'Site profissional, rápido e preparado para aparecer no Google.',
    objetivos: [
      'Transmitir uma imagem profissional e atual da empresa',
      'Aparecer no Google para as buscas dos clientes',
      'Gerar contatos pelo WhatsApp e pelo formulário',
    ],
    sugestoes: [
      'Carregar rápido no celular',
      'Facilitar a atualização de conteúdo pela equipe',
      'Medir visitas e contatos com Google Analytics',
      'Integrar com as redes sociais da empresa',
    ],
    escopo: [
      { titulo: 'Design exclusivo e responsivo', descricao: 'Layout alinhado à identidade da marca, pensado para celular, tablet e computador.' },
      { titulo: 'Páginas do site', descricao: 'Início, Sobre, Serviços e Contato (ajustável conforme a necessidade).' },
      { titulo: 'SEO técnico', descricao: 'Títulos e descrições por página, sitemap, dados estruturados e cadastro no Google Search Console.' },
      { titulo: 'Integrações', descricao: 'Botão de WhatsApp, formulário de contato e Google Analytics.' },
    ],
    cronograma: [
      { titulo: 'Briefing e conteúdo', dias: 1 },
      { titulo: 'Desenvolvimento do layout', dias: 2 },
      { titulo: 'Programação e desenvolvimento', dias: 5 },
      { titulo: 'Testes e ajustes', dias: 1 },
      { titulo: 'Publicação e apresentação', dias: 1 },
    ],
    investimento: [{ descricao: 'Desenvolvimento de site institucional', valor: 0 }],
    observacao: OBS_WEB,
  },
  {
    id: 'landing',
    nome: 'Landing page',
    titulo: 'Landing page de alta conversão',
    subtitulo: 'Página focada em uma oferta, pronta para anúncios e captação de leads.',
    objetivos: ['Converter visitantes em contatos ou vendas', 'Apoiar campanhas de anúncios (Google e Meta)', 'Comunicar a oferta de forma clara e direta'],
    sugestoes: ['Medir conversões com Meta Pixel e Google Ads', 'Testar versões diferentes da página (A/B)', 'Integrar os leads ao CRM'],
    escopo: [
      { titulo: 'Copy e estrutura de conversão', descricao: 'Organização da oferta, benefícios, prova social e chamadas para ação.' },
      { titulo: 'Design responsivo', descricao: 'Página única com foco em velocidade e leitura no celular.' },
      { titulo: 'Captação de leads', descricao: 'Formulário e/ou WhatsApp, com integração ao e-mail ou CRM.' },
      { titulo: 'Rastreamento', descricao: 'Google Analytics, Meta Pixel e eventos de conversão.' },
    ],
    cronograma: [
      { titulo: 'Briefing e copy', dias: 1 },
      { titulo: 'Design', dias: 2 },
      { titulo: 'Desenvolvimento e integrações', dias: 2 },
      { titulo: 'Testes e publicação', dias: 1 },
    ],
    investimento: [{ descricao: 'Desenvolvimento de landing page', valor: 0 }],
    observacao: OBS_WEB,
  },
  {
    id: 'loja',
    nome: 'Loja virtual',
    titulo: 'Loja virtual',
    subtitulo: 'E-commerce completo para vender on-line com pagamento e frete integrados.',
    objetivos: ['Vender on-line 24 horas por dia', 'Oferecer uma compra simples e segura', 'Aparecer no Google com as páginas de produto'],
    sugestoes: ['Recuperar carrinhos abandonados', 'Integrar com o estoque/ERP', 'Vender também pelo Instagram e Google Shopping'],
    escopo: [
      { titulo: 'Design da loja', descricao: 'Vitrine, páginas de produto, carrinho e checkout responsivos.' },
      { titulo: 'Cadastro de produtos', descricao: 'Estrutura de categorias e carga inicial de produtos.' },
      { titulo: 'Pagamentos e frete', descricao: 'Pix, cartão e boleto; cálculo de frete pelos Correios ou transportadora.' },
      { titulo: 'SEO e métricas', descricao: 'Páginas otimizadas para o Google e Google Analytics com eventos de compra.' },
    ],
    cronograma: [
      { titulo: 'Briefing e configuração da plataforma', dias: 5 },
      { titulo: 'Design da loja', dias: 5 },
      { titulo: 'Desenvolvimento e integrações', dias: 10 },
      { titulo: 'Cadastro, testes e lançamento', dias: 5 },
    ],
    investimento: [{ descricao: 'Desenvolvimento de loja virtual', valor: 0 }],
    observacao: 'Valores não incluem mensalidade da plataforma, taxas de pagamento, hospedagem e domínio.',
  },
  {
    id: 'sistema',
    nome: 'Sistema web',
    titulo: 'Sistema web sob medida',
    subtitulo: 'Plataforma para organizar processos, dados e equipe em um só lugar.',
    objetivos: ['Centralizar processos que hoje estão em planilhas e mensagens', 'Dar visão em tempo real dos números do negócio', 'Reduzir trabalho manual e retrabalho da equipe'],
    sugestoes: ['Controlar acessos por perfil de usuário', 'Gerar relatórios em PDF e Excel', 'Integrar com sistemas já usados pela empresa', 'Funcionar bem no celular'],
    escopo: [
      { titulo: 'Descoberta e prototipação', descricao: 'Mapeamento dos processos e protótipo navegável aprovado antes do desenvolvimento.' },
      { titulo: 'Painel e telas do sistema', descricao: 'Dashboard, cadastros, listagens e fluxos definidos no protótipo.' },
      { titulo: 'Usuários e permissões', descricao: 'Login seguro com perfis de acesso.' },
      { titulo: 'Infraestrutura em nuvem', descricao: 'Banco de dados, backups e publicação com acompanhamento.' },
    ],
    cronograma: [
      { titulo: 'Descoberta e protótipo', dias: 7 },
      { titulo: 'Desenvolvimento (entregas semanais)', dias: 30 },
      { titulo: 'Testes com a equipe', dias: 5 },
      { titulo: 'Lançamento e treinamento', dias: 5 },
    ],
    investimento: [{ descricao: 'Desenvolvimento do sistema web', valor: 0 }],
    observacao: 'Valores não incluem custos de infraestrutura em nuvem e licenças de terceiros.',
  },
  {
    id: 'app',
    nome: 'Aplicativo',
    titulo: 'Aplicativo mobile',
    subtitulo: 'App para iOS e Android, do protótipo à publicação nas lojas.',
    objetivos: ['Estar no celular do cliente com a marca da empresa', 'Oferecer uma experiência simples e rápida', 'Publicar na App Store e no Google Play'],
    sugestoes: ['Enviar notificações para os usuários', 'Receber pagamentos dentro do app', 'Acompanhar uso e métricas do app'],
    escopo: [
      { titulo: 'UX e protótipo', descricao: 'Fluxos do usuário e protótipo navegável para validação.' },
      { titulo: 'Design das telas', descricao: 'Interface seguindo os padrões de iOS e Android.' },
      { titulo: 'Desenvolvimento', descricao: 'App multiplataforma (React Native ou Flutter) com integração às APIs necessárias.' },
      { titulo: 'Publicação nas lojas', descricao: 'Preparação das páginas e envio para App Store e Google Play.' },
    ],
    cronograma: [
      { titulo: 'Protótipo', dias: 10 },
      { titulo: 'Design das telas', dias: 10 },
      { titulo: 'Desenvolvimento', dias: 40 },
      { titulo: 'Testes e publicação', dias: 10 },
    ],
    investimento: [{ descricao: 'Desenvolvimento do aplicativo', valor: 0 }],
    observacao: 'Valores não incluem as taxas das contas de desenvolvedor da Apple e do Google.',
  },
  {
    id: 'ia',
    nome: 'IA e automação',
    titulo: 'Inteligência artificial e automação',
    subtitulo: 'Assistente de IA e automações para atender mais rápido e economizar tempo da equipe.',
    objetivos: ['Responder clientes 24 horas por dia', 'Automatizar tarefas repetitivas da equipe', 'Manter um humano no controle quando necessário'],
    sugestoes: ['Atender pelo WhatsApp', 'Responder com base nos documentos da empresa', 'Registrar atendimentos no CRM'],
    escopo: [
      { titulo: 'Diagnóstico', descricao: 'Levantamento das tarefas e atendimentos com maior potencial de automação.' },
      { titulo: 'Assistente de IA', descricao: 'Configuração do assistente com o conhecimento e o tom de voz da empresa.' },
      { titulo: 'Integrações', descricao: 'Conexão com WhatsApp, site, planilhas ou CRM, conforme o projeto.' },
      { titulo: 'Acompanhamento', descricao: 'Ajustes com base nas conversas reais nas primeiras semanas.' },
    ],
    cronograma: [
      { titulo: 'Diagnóstico', dias: 3 },
      { titulo: 'Configuração e integrações', dias: 7 },
      { titulo: 'Testes com a equipe', dias: 3 },
      { titulo: 'Lançamento e acompanhamento', dias: 10 },
    ],
    investimento: [{ descricao: 'Implantação do assistente de IA', valor: 0 }],
    observacao: 'Valores não incluem o consumo das plataformas de IA e de mensagens, cobrado por uso.',
  },
  {
    id: 'identidade',
    nome: 'Identidade visual',
    titulo: 'Identidade visual',
    subtitulo: 'Marca consistente para transmitir confiança em todos os pontos de contato.',
    objetivos: ['Criar uma marca memorável e profissional', 'Padronizar a comunicação visual da empresa'],
    sugestoes: ['Aplicar a marca nas redes sociais', 'Criar papelaria e materiais impressos'],
    escopo: [
      { titulo: 'Pesquisa e conceito', descricao: 'Referências, posicionamento e direção criativa.' },
      { titulo: 'Logo e variações', descricao: 'Logo principal, versões horizontal, vertical e monocromática.' },
      { titulo: 'Paleta e tipografia', descricao: 'Cores e fontes oficiais da marca.' },
      { titulo: 'Manual da marca', descricao: 'Guia de uso com aplicações e arquivos finais.' },
    ],
    cronograma: [
      { titulo: 'Pesquisa e conceito', dias: 3 },
      { titulo: 'Criação e apresentação', dias: 5 },
      { titulo: 'Ajustes e manual da marca', dias: 3 },
    ],
    investimento: [{ descricao: 'Criação da identidade visual', valor: 0 }],
  },
];
