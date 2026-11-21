/**
 * Fonte única de dados do site da Astravox.
 * Campo vazio = o site esconde o item automaticamente. Nunca preencha com dado inventado:
 * tudo aqui é publicado e lido pelo Google.
 * Estes valores alimentam as páginas, as meta tags, o JSON-LD (Google), o sitemap e o llms.txt.
 */

export const SITE = {
  name: 'Astravox',
  legalName: 'Astravox Inteligência Digital',
  url: 'https://astravox.com.br', // domínio principal (sem barra no final)
  locale: 'pt_BR',
  lang: 'pt-BR',
  tagline: 'Agência digital de produtos, sites e IA',
  description:
    'A Astravox é uma agência digital que cria sites, apps, plataformas SaaS e soluções com IA para empresas que querem crescer com tecnologia. Do design ao código, com foco em resultado.',
  foundingYear: null as number | null, // TODO: ano de fundação
  email: '', // TODO: e-mail de contato
  whatsapp: '5565998113738', // só números, com DDI 55 + DDD
  whatsappDisplay: '+55 (65) 99811-3738',
  phone: '+55-65-99811-3738', // usado no schema (Google)
  address: {
    street: '', // TODO (opcional; deixe vazio se atende 100% remoto)
    city: 'Cuiabá',
    region: 'MT',
    postalCode: '', // TODO
    country: 'BR',
  },
  areaServed: ['Brasil'], // TODO: inclua outros países se atender
  responseTime: 'Respondemos em até 1 dia útil',
  calendarUrl: '', // TODO: link do Calendly/Cal.com, se tiver
  social: {
    instagram: '', // TODO
    linkedin: '', // TODO
    behance: '', // TODO
    youtube: '', // TODO
    /** Perfil da Empresa no Google (link de compartilhamento) */
    google: 'https://share.google/Dt7BLgbKud2z1osu6',
  },
  /** Link direto para avaliar a Astravox no Google (Perfil da Empresa → Solicitar avaliações) */
  reviewUrl: 'https://g.page/r/CR4pJiflNRZjEBM/review',
  /** Google Search Console: cole aqui o código da meta tag de verificação */
  googleSiteVerification: '', // TODO
  /** Google Analytics 4 (ex.: G-XXXXXXX). Só carrega após o consentimento de cookies. */
  gaMeasurementId: '', // TODO
};

export const hasWhatsapp = () => SITE.whatsapp.length >= 12;

export const whatsappLink = (msg = 'Olá, Astravox! Quero conversar sobre um projeto.') =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;

export const NAV = [
  { label: 'Serviços', href: '/servicos/' },
  { label: 'Projetos', href: '/projetos/' },
  { label: 'Sobre', href: '/sobre/' },
  { label: 'Contato', href: '/contato/' },
];

// TODO: números reais (ex.: { value: '50+', label: 'Projetos entregues', detail: '...' }). Vazio = seção escondida.
export const STATS: { value: string; label: string; detail: string }[] = [];

export type Service = {
  slug: string;
  name: string;
  short: string;
  /** Título da página (≤ 60 caracteres) e meta description (≤ 155) */
  title: string;
  metaDescription: string;
  intro: string;
  deliverables: string[];
  forWho: string[];
  tags: string[];
  faq: { q: string; a: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: 'criacao-de-sites',
    name: 'Criação de Sites',
    short: 'Sites institucionais e landing pages rápidos, bonitos e prontos para o Google.',
    title: 'Criação de Sites Profissionais e Landing Pages | Astravox',
    metaDescription:
      'Criação de sites profissionais e landing pages com SEO técnico, carregamento rápido e design sob medida. Fale com a Astravox.',
    intro:
      'Desenhamos e desenvolvemos sites que carregam em menos de um segundo, explicam o que você vende em poucas linhas e aparecem no Google. Cada página nasce com SEO técnico, dados estruturados e métricas de conversão.',
    deliverables: [
      'Arquitetura de informação e copy orientados a conversão',
      'Design exclusivo, responsivo e acessível',
      'Desenvolvimento em Astro, Next.js, Webflow ou Framer',
      'SEO técnico: meta tags, sitemap, schema.org e Core Web Vitals',
      'Integração com Google Analytics, Search Console e CRM',
      'Treinamento para sua equipe editar o conteúdo',
    ],
    forWho: ['Empresas que precisam de presença profissional', 'Negócios que querem gerar leads pelo Google', 'Lançamentos e campanhas com landing pages'],
    tags: ['Sites institucionais', 'Landing pages', 'SEO técnico'],
    faq: [
      { q: 'Quanto tempo leva para criar um site?', a: 'Um site institucional leva de 3 a 6 semanas; uma landing page, de 1 a 2 semanas. O prazo exato sai na proposta, depois da conversa inicial.' },
      { q: 'O site já sai otimizado para o Google?', a: 'Sim. Todo site sai com SEO técnico completo: títulos e descrições por página, sitemap, robots.txt, dados estruturados, URLs amigáveis e nota alta no PageSpeed.' },
      { q: 'Vou conseguir editar o site sozinho?', a: 'Sim. Entregamos com um painel de edição ou em uma plataforma visual, e treinamos sua equipe.' },
    ],
  },
  {
    slug: 'desenvolvimento-de-aplicativos',
    name: 'Apps Mobile',
    short: 'Aplicativos iOS e Android do fluxo inicial às telas prontas para a loja.',
    title: 'Desenvolvimento de Aplicativos iOS e Android | Astravox',
    metaDescription:
      'Desenvolvimento de aplicativos iOS e Android: UX, design de interface e código. Da ideia à publicação na App Store e no Google Play.',
    intro:
      'Do fluxo do usuário à publicação nas lojas. Desenhamos apps com padrões nativos, animações que fazem sentido e uma base de código que sua equipe consegue manter.',
    deliverables: [
      'Pesquisa, fluxos e protótipos navegáveis',
      'Design de interface com padrões iOS e Android',
      'Desenvolvimento em React Native ou Flutter',
      'Integração com APIs, pagamentos e notificações',
      'Publicação na App Store e no Google Play',
      'Monitoramento, métricas e evolução contínua',
    ],
    forWho: ['Startups lançando um MVP', 'Empresas digitalizando um serviço', 'Produtos que precisam de uma nova versão'],
    tags: ['iOS', 'Android', 'React Native'],
    faq: [
      { q: 'Vocês fazem apps nativos ou híbridos?', a: 'Trabalhamos principalmente com React Native e Flutter, que entregam experiência nativa com uma única base de código. Para casos específicos, desenvolvemos nativo.' },
      { q: 'Vocês publicam o app nas lojas?', a: 'Sim. Cuidamos de todo o processo de publicação na App Store e no Google Play, incluindo as páginas das lojas.' },
    ],
  },
  {
    slug: 'plataformas-saas-e-dashboards',
    name: 'SaaS & Dashboards',
    short: 'Plataformas web, painéis e sistemas internos que sua equipe entende em minutos.',
    title: 'Desenvolvimento de SaaS, Dashboards e Sistemas Web | Astravox',
    metaDescription:
      'Criamos plataformas SaaS, dashboards e sistemas web sob medida: UX, design e desenvolvimento full-stack para empresas B2B.',
    intro:
      'Produtos B2B vivem ou morrem pela clareza. Desenhamos e construímos dashboards, onboarding e painéis administrativos que reduzem o tempo até o primeiro valor e o volume de suporte.',
    deliverables: [
      'Descoberta de produto e mapeamento de jornadas',
      'UX de dashboards, tabelas e fluxos complexos',
      'Design system com componentes reutilizáveis',
      'Desenvolvimento full-stack (front-end, back-end e banco)',
      'Autenticação, permissões, cobrança e integrações',
      'Infraestrutura em nuvem com deploy contínuo',
    ],
    forWho: ['SaaS B2B em crescimento', 'Empresas com processos em planilhas', 'Times que precisam de um painel interno'],
    tags: ['SaaS', 'Dashboards', 'Sistemas web'],
    faq: [
      { q: 'Vocês trabalham junto com o meu time de desenvolvimento?', a: 'Sim. Podemos assumir o produto de ponta a ponta ou atuar com seu time, entregando design, front-end ou módulos específicos.' },
    ],
  },
  {
    slug: 'solucoes-com-inteligencia-artificial',
    name: 'Soluções com IA',
    short: 'Agentes, chatbots e automações com IA integrados ao seu negócio.',
    title: 'Soluções com Inteligência Artificial para Empresas | Astravox',
    metaDescription:
      'Agentes de IA, chatbots, copilotos e automações com inteligência artificial integrados aos seus sistemas. Projetos seguros e mensuráveis.',
    intro:
      'IA útil é a que resolve uma tarefa real do seu time. Projetamos agentes, chatbots e automações com interfaces claras, limites seguros e humanos no controle — e medimos o ganho.',
    deliverables: [
      'Diagnóstico de processos com potencial de automação',
      'Agentes e assistentes com LLMs (Claude, GPT e outros)',
      'Chatbots de atendimento no site e no WhatsApp',
      'RAG: IA que responde com base nos seus documentos',
      'Interfaces de IA com sinais de confiança e revisão humana',
      'Integração com CRM, ERP e ferramentas internas',
    ],
    forWho: ['Times com tarefas repetitivas', 'Atendimento com alto volume', 'Produtos que querem recursos de IA'],
    tags: ['Agentes de IA', 'Chatbots', 'Automação'],
    faq: [
      { q: 'Meus dados ficam seguros?', a: 'Sim. Usamos provedores com garantia de não treinamento sobre seus dados, controle de acesso e registros de uso, em conformidade com a LGPD.' },
      { q: 'Dá para colocar IA no WhatsApp da empresa?', a: 'Sim. Integramos assistentes de IA ao WhatsApp Business, com transferência para um atendente humano quando necessário.' },
    ],
  },
  {
    slug: 'ux-ui-design',
    name: 'UX/UI Design',
    short: 'Design de produto, auditoria de UX e redesign focados em conversão.',
    title: 'UX/UI Design, Auditoria de UX e Redesign | Astravox',
    metaDescription:
      'Design de interface (UI), experiência do usuário (UX), auditoria e redesign de sites e apps para aumentar ativação e conversão.',
    intro:
      'Encontramos o que trava ativação e conversão no seu produto, priorizamos por impacto e redesenhamos. Você recebe protótipos testáveis e arquivos que o time de desenvolvimento consegue implementar.',
    deliverables: [
      'Auditoria de UX com lista priorizada de problemas',
      'Pesquisa e testes de usabilidade com usuários',
      'Wireframes e protótipos navegáveis no Figma',
      'Interface final com estados, variações e responsivo',
      'Handoff organizado para desenvolvimento',
    ],
    forWho: ['Produtos com conversão baixa', 'Apps que precisam de um redesign', 'Times sem designer dedicado'],
    tags: ['UX', 'UI', 'Figma'],
    faq: [
      { q: 'O que é uma auditoria de UX?', a: 'Uma análise do seu site ou app que aponta, por ordem de impacto, os pontos que confundem o usuário e reduzem a conversão, com recomendações práticas.' },
    ],
  },
  {
    slug: 'branding-e-design-system',
    name: 'Branding & Design System',
    short: 'Identidade visual e bibliotecas de componentes que escalam com o produto.',
    title: 'Branding, Identidade Visual e Design System | Astravox',
    metaDescription:
      'Criação de identidade visual, branding e design systems com tokens, componentes e documentação prontos para desenvolvimento.',
    intro:
      'Uma marca consistente transmite confiança antes da primeira conversa. Criamos identidade visual e design systems com tokens, componentes e documentação, para que cada nova tela saia mais rápida e coerente.',
    deliverables: [
      'Estratégia e posicionamento de marca',
      'Logo, paleta, tipografia e manual da marca',
      'Design tokens (cores, espaços, tipografia)',
      'Biblioteca de componentes no Figma e em código',
      'Documentação de uso para design e desenvolvimento',
    ],
    forWho: ['Empresas nascendo ou se reposicionando', 'Produtos com interface inconsistente', 'Times que querem ganhar velocidade'],
    tags: ['Identidade visual', 'Design tokens', 'Componentes'],
    faq: [
      { q: 'Vocês criam só o logo?', a: 'Criamos a identidade completa — logo, cores, tipografia e aplicações —, mas também atendemos projetos menores quando faz sentido.' },
    ],
  },
];

export const INDUSTRIES = [
  { name: 'Startups & SaaS', badge: 'Core', text: 'MVPs, plataformas e dashboards que mostram valor nos primeiros minutos.', tags: ['MVP', 'Onboarding', 'Assinaturas'] },
  { name: 'Saúde', badge: 'Especialidade', text: 'Agendamento, prontuário e telessaúde com clareza e conformidade com a LGPD.', tags: ['Clínicas', 'Pacientes', 'Telessaúde'] },
  { name: 'Finanças', badge: 'Especialidade', text: 'Fluxos financeiros simples de entender e fáceis de confiar.', tags: ['Investimentos', 'Pagamentos', 'Crédito'] },
  { name: 'Varejo & Serviços', badge: 'Core', text: 'Sites e apps que transformam visitas em pedidos e agendamentos.', tags: ['E-commerce', 'Delivery', 'Agendamento'] },
];

// TODO: cases reais. Vazio = seção e página de cases escondidas.
export const CASES: { title: string; client: string; category: string; text: string; result: string; hue: number }[] = [];

export const PROCESS = [
  { step: '01', title: 'Conversa inicial', text: 'Uma chamada gratuita de 20 minutos para entender seu objetivo, público e prazo.' },
  { step: '02', title: 'Proposta', text: 'Escopo, etapas e cronograma por escrito em até 2 dias úteis.' },
  { step: '03', title: 'Design', text: 'Protótipos navegáveis e revisões semanais com você no Figma.' },
  { step: '04', title: 'Desenvolvimento', text: 'Código limpo, testado e publicado em ambiente de homologação a cada etapa.' },
  { step: '05', title: 'Lançamento e evolução', text: 'Publicação, métricas e um plano de melhorias contínuas.' },
];

// TODO: depoimentos reais, com autorização. Vazio = seção escondida.
export const TESTIMONIALS: { quote: string; name: string; role: string; initials: string }[] = [];

export const FAQ = [
  { q: 'O que a Astravox faz?', a: 'A Astravox é uma agência digital que cria sites, aplicativos, plataformas SaaS, dashboards e soluções com inteligência artificial. Cuidamos da estratégia, do design e do desenvolvimento.' },
  { q: 'Vocês atendem empresas de todo o Brasil?', a: 'Sim. Trabalhamos de forma remota com empresas de todo o Brasil e do exterior, com reuniões por vídeo no seu horário.' },
  { q: 'Em quanto tempo o projeto fica pronto?', a: 'Landing pages ficam prontas em 1 a 2 semanas, sites em 3 a 6 semanas e MVPs de apps ou SaaS em 8 a 12 semanas, em média.' },
  { q: 'O site já sai preparado para aparecer no Google?', a: 'Sim. Todo projeto web sai com SEO técnico: títulos e descrições por página, sitemap, dados estruturados (schema.org), URLs amigáveis e alto desempenho no Core Web Vitals.' },
  { q: 'O código e os arquivos ficam comigo?', a: 'Sim. Ao final do projeto você é dono do código, dos arquivos de design e de todos os acessos.' },
];

export const MENU = NAV;
