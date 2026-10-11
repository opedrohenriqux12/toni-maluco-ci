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
    id: "x-post-nikosolenne",
    author: {
      name: "niko.",
      handle: "@nikosolenne",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Empreendedor Tech"
    },
    content: "ISTO É UMA LOUCURA 🚨\n\nAlguém subiu no GitHub um repositório com o qual você usa Claude Code DE GRAÇA e PARA SEMPRE.\n\nRedireciona todo o seu tráfego para 49 provedores gratuitos, como DeepSeek ou Kimi. 1.300 milhões de tokens grátis por mês. Se configura em 5 minutos.",
    publishedAt: "9 de out",
    timestamp: "2026-10-09T18:30:00Z",
    metrics: {
      likes: 2000,
      reposts: 208,
      replies: 27,
      views: "186K",
      viralVelocity: "Explodindo (+500/min)"
    },
    category: "ai_trends",
    aiAnalysis: {
      thesis: "Proxy de roteamento gratuito para Claude Code: Permite rodar agentes autônomos e geração ilimitada de código usando cotas gratuitas de DeepSeek e Kimi sem gastar \$100/mês de API Anthropic.",
      monetizationPotential: "Altíssimo",
      marketNiche: "Infraestrutura de IA Custo-Zero & Automação de Código",
      actionPlan: "Integrar proxy open-source no ambiente do Toni Maluco para reduzir custos de chamadas de LLM para zero e repassar o software com margem de 100%.",
      estimatedProfitBrl: "Economia de R$ 3.500/mês + Venda de setups R$ 1.200 cada"
    },
    relatedUrl: "https://x.com/nikosolenne"
  },
  {
    id: "x-post-cvyh-rea",
    author: {
      name: "CV.YH",
      handle: "@0xCVYH",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Pesquisador IA"
    },
    content: "Engenharia reversa de qualquer coisa.\n\ngithub.com/morluto/rea\n\nREA: Reverse Engineer Anything — One MCP for reverse engineering across binaries, applications, and runtime behavior. See a feature you like. Understand how it works, down to the binary level. #1 Repository Of The Day no GitHub Trending.",
    publishedAt: "8 de out",
    timestamp: "2026-10-08T15:20:00Z",
    metrics: {
      likes: 3000,
      reposts: 331,
      replies: 29,
      views: "199K",
      viralVelocity: "Explodindo (+500/min)"
    },
    category: "business_opportunity",
    aiAnalysis: {
      thesis: "Protocolo MCP para clonar e fazer engenharia reversa de softwares, APIs de concorrentes e bots proprietários em minutos com agentes de IA.",
      monetizationPotential: "Imediato",
      marketNiche: "Engenharia Reversa & Clonagem de Micro-SaaS Concorrente",
      actionPlan: "Utilizar o REA MCP (`npx rea-agents setup`) para auditar as rotas ocultas de concorrentes no Mercado Livre, Shopee e GGMAX, replicando suas automações com vantagem de preço.",
      estimatedProfitBrl: "R$ 12.000 a R$ 35.000 por clonagem estruturada"
    },
    relatedUrl: "https://github.com/morluto/rea"
  },
  {
    id: "x-post-elon-grok3",
    author: {
      name: "Elon Musk",
      handle: "@elonmusk",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Elon Musk"
    },
    content: "xAI Grok 3 training on Colossus is showing capabilities beyond anything released. Real-time vision + reasoning will soon allow anyone to run specialized business agents with near-zero latency.",
    publishedAt: "há 3h",
    timestamp: "2026-10-10T18:00:00Z",
    metrics: {
      likes: 68400,
      reposts: 12900,
      replies: 4200,
      views: "1.8M",
      viralVelocity: "Explodindo (+500/min)"
    },
    category: "elon_musk",
    aiAnalysis: {
      thesis: "APIs multimodais de baixa latência da xAI: Criação de robôs de atendimento com visão computacional para verificar prints de comprovantes PIX instantâneos em lojas online.",
      monetizationPotential: "Altíssimo",
      marketNiche: "Automação B2B de Suporte & Validação PIX",
      actionPlan: "Preparar conectores webhook prontos para a Grok API e vender automação de suporte 24/7 para vendedores de infoprodutos e e-commerce.",
      estimatedProfitBrl: "R$ 8.500 a R$ 22.000 / mês recorrente"
    },
    relatedUrl: "https://x.com/elonmusk"
  },
  {
    id: "x-post-viral-repricer",
    author: {
      name: "Rowan Cheung",
      handle: "@rowancheung",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      badge: "Líder BigTech"
    },
    content: "3 new AI tools went viral on X this week with 10M+ impressions: 1) Video generation for TikTok Ads in 30s, 2) Reverse engineering viral competitor landing pages, 3) Auto-pricing dynamic repricers for marketplace sellers.",
    publishedAt: "há 5h",
    timestamp: "2026-10-10T16:00:00Z",
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
  }
];
