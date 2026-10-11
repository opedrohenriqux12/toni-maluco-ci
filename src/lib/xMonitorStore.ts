export interface XPostOpportunity {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
    badge?: "Elon Musk" | "Pesquisador IA" | "Empreendedor Tech" | "Investidor" | "Líder BigTech";
  };
  content: string;
  publishedAt: string; // Ex: "há 12 min"
  timestamp: string; // ISO
  metrics: {
    likes: number;
    reposts: number;
    replies: number;
    views: string;
    viralVelocity: "Explodindo (+500/min)" | "Alta (+180/min)" | "Constante";
  };
  category: "elon_musk" | "ai_trends" | "business_opportunity" | "ecommerce_viral";
  aiAnalysis: {
    thesis: string;
    monetizationPotential: "Altíssimo" | "Alto" | "Médio" | "Imediato";
    marketNiche: string;
    actionPlan: string;
    estimatedProfitBrl: string;
  };
  relatedUrl?: string;
  isSaved?: boolean;
  convertedToOpportunity?: boolean;
}

export interface XAccountConfig {
  connectedHandle: string;
  isConnected: boolean;
  apiKey?: string;
  bearerToken?: string;
  monitoringKeywords: string[];
  autoFilterAI: boolean;
  lastSyncedAt: string;
  userProfile?: {
    name: string;
    handle: string;
    avatar: string;
    followersCount: string;
    followingCount: string;
    bio: string;
    status: "Sincronizado & Ativo" | "Aguardando Sincronização";
  };
}

export const initialXConfig: XAccountConfig = {
  connectedHandle: "@originalph06",
  isConnected: true,
  apiKey: "x_live_auth_stream_active",
  monitoringKeywords: [
    "Elon Musk", "Grok 3", "xAI", "AI Agents", "Autonomous LLM", 
    "SaaS AI", "Ecommerce viral", "Micro-SaaS", "DeepSeek", "Prompt Engineering"
  ],
  autoFilterAI: true,
  lastSyncedAt: new Date().toISOString(),
  userProfile: {
    name: "PH | @originalph06",
    handle: "@originalph06",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    followersCount: "1.240",
    followingCount: "389",
    bio: "Empreendedor digital & Tech Builder. Monitorando oportunidades de IA, Grok e novos modelos de negócios.",
    status: "Sincronizado & Ativo"
  }
};

export const initialXPosts: XPostOpportunity[] = [
  {
    id: "x-post-1",
    author: {
      name: "Elon Musk",
      handle: "@elonmusk",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Elon Musk"
    },
    content: "xAI Grok 3 training on the 100k H100 Colossus cluster is showing capabilities beyond anything currently released. Real-time vision + reasoning will soon allow anyone to run specialized business agents with near-zero latency.",
    publishedAt: "há 14 min",
    timestamp: "2026-10-10T20:55:00Z",
    metrics: {
      likes: 68400,
      reposts: 12900,
      replies: 4200,
      views: "1.8M",
      viralVelocity: "Explodindo (+500/min)"
    },
    category: "elon_musk",
    aiAnalysis: {
      thesis: "Lançamento iminente de APIs multimodais de ultrabaixa latência pela xAI. Criação de microsserviços e robôs de atendimento em tempo real será commoditizada para quem se posicionar primeiro.",
      monetizationPotential: "Altíssimo",
      marketNiche: "Automação B2B de Atendimento & E-commerce",
      actionPlan: "Preparar conectores webhook prontos para a Grok API e vender automação de suporte 24/7 para lojas de Shopify e Mercado Livre.",
      estimatedProfitBrl: "R$ 8.500 a R$ 22.000 / mês recorrente"
    },
    relatedUrl: "https://x.com/elonmusk"
  },
  {
    id: "x-post-2",
    author: {
      name: "Andrej Karpathy",
      handle: "@karpathy",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Pesquisador IA"
    },
    content: "The bottleneck is no longer model intelligence, but context distillation and human workflows. Solo entrepreneurs using agentic pipelines are already generating revenue that previously required 20-person agencies.",
    publishedAt: "há 42 min",
    timestamp: "2026-10-10T20:25:00Z",
    metrics: {
      likes: 24300,
      reposts: 5800,
      replies: 890,
      views: "720K",
      viralVelocity: "Alta (+180/min)"
    },
    category: "ai_trends",
    aiAnalysis: {
      thesis: "Substituição de agências tradicionais por 'One-Person AI Agencies'. Clientes pagam por velocidade de entrega e sistemas ponta a ponta.",
      monetizationPotential: "Imediato",
      marketNiche: "Agência de Automação com IA (AAA)",
      actionPlan: "Criar pacote 'Implantação de Agente IA em 48 Horas' para infoprodutores e e-commerces que precisam de respostas instantâneas.",
      estimatedProfitBrl: "R$ 4.500 por implementação"
    },
    relatedUrl: "https://x.com/karpathy"
  },
  {
    id: "x-post-3",
    author: {
      name: "Rowan Cheung",
      handle: "@rowancheung",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Líder BigTech"
    },
    content: "3 new AI tools went viral on X this week with 10M+ impressions: 1) Video generation for TikTok Ads in 30s, 2) Reverse engineering viral competitor landing pages, 3) Auto-pricing dynamic repricers for marketplace sellers.",
    publishedAt: "há 1h 10min",
    timestamp: "2026-10-10T19:50:00Z",
    metrics: {
      likes: 18900,
      reposts: 4100,
      replies: 610,
      views: "540K",
      viralVelocity: "Alta (+180/min)"
    },
    category: "ecommerce_viral",
    aiAnalysis: {
      thesis: "Ferramentas de repricing dinâmico e criativos automáticos em vídeo para TikTok Ads estão no pico de demanda entre lojistas digitais.",
      monetizationPotential: "Alto",
      marketNiche: "Ferramentas para Vendedores Mercado Livre & Shopee",
      actionPlan: "Adicionar script de cálculo de margem dinâmica na Calculadora do ToniMaluco e rodar campanhas para dropshippers.",
      estimatedProfitBrl: "R$ 3.000 a R$ 9.000"
    },
    relatedUrl: "https://x.com/rowancheung"
  },
  {
    id: "x-post-4",
    author: {
      name: "Greg Brockman",
      handle: "@gdb",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Pesquisador IA"
    },
    content: "Agents that can read external database logs, verify financial discrepancies, and autonomously suggest corrective pricing actions are ready for enterprise production today.",
    publishedAt: "há 2h 05min",
    timestamp: "2026-10-10T19:00:00Z",
    metrics: {
      likes: 31200,
      reposts: 7400,
      replies: 1100,
      views: "980K",
      viralVelocity: "Alta (+180/min)"
    },
    category: "ai_trends",
    aiAnalysis: {
      thesis: "Validação direta da arquitetura que construímos no ToniMaluco C.I (monitoramento de margens, DRE e taxas em tempo real).",
      monetizationPotential: "Altíssimo",
      marketNiche: "B.I Financeiro Inteligente para Vendedores",
      actionPlan: "Expandir o conselheiro 'Vitor Financeiro' com alertas automáticos de discrepância de taxas entre plataformas (Shopee vs GGMAX vs Mercado Livre).",
      estimatedProfitBrl: "R$ 15.000 / mês"
    },
    relatedUrl: "https://x.com/gdb"
  },
  {
    id: "x-post-5",
    author: {
      name: "Nick St. Pierre",
      handle: "@nickfloats",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Empreendedor Tech"
    },
    content: "Look at the search volume for 'Black Friday AI Deals' on X compared to traditional search engines. People are asking X and Grok directly for vetted purchase recommendations. SEO is shifting to AI Prompt Visibility.",
    publishedAt: "há 3h 15min",
    timestamp: "2026-10-10T17:50:00Z",
    metrics: {
      likes: 12400,
      reposts: 2900,
      replies: 420,
      views: "380K",
      viralVelocity: "Constante"
    },
    category: "business_opportunity",
    aiAnalysis: {
      thesis: "GEO (Generative Engine Optimization) - Otimizar produtos e ofertas para serem recomendados pelo Grok e ChatGPT antes da Black Friday.",
      monetizationPotential: "Alto",
      marketNiche: "Posicionamento de Catálogo em Buscadores de IA",
      actionPlan: "Cadastrar páginas de produtos com dados estruturados e metadados que agentes de IA citam como primeira opção.",
      estimatedProfitBrl: "R$ 6.000 a R$ 14.000"
    },
    relatedUrl: "https://x.com"
  },
  {
    id: "x-post-6",
    author: {
      name: "Elon Musk",
      handle: "@elonmusk",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Elon Musk"
    },
    content: "X Payments is entering private beta in select jurisdictions. Direct peer-to-peer digital balance transfers with zero friction. Creators and digital good merchants will see immediate impact.",
    publishedAt: "há 4h 30min",
    timestamp: "2026-10-10T16:30:00Z",
    metrics: {
      likes: 95400,
      reposts: 22100,
      replies: 7800,
      views: "3.2M",
      viralVelocity: "Explodindo (+500/min)"
    },
    category: "elon_musk",
    aiAnalysis: {
      thesis: "Lançamento iminente do X Payments para venda de bens digitais (gift cards, chaves, licenças) diretamente no feed do X sem intermediários caros.",
      monetizationPotential: "Altíssimo",
      marketNiche: "Venda Direta de Contas e Chaves Digitais no X",
      actionPlan: "Criar audiência nichada no X em português sobre games e descontos para plugar a loja digital assim que o X Payments liberar no Brasil.",
      estimatedProfitBrl: "R$ 18.000 a R$ 40.000"
    },
    relatedUrl: "https://x.com/elonmusk"
  }
];
