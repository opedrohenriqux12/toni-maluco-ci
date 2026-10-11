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

// Dados zerados: Nenhum dado mock/falso. O usuário popula em tempo real via IA da NVIDIA ou suas buscas.
export const initialXPosts: XPostOpportunity[] = [];
