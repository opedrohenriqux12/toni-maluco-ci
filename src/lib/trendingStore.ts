import { products, netMargin } from "./data";

export type CategoryType = "FPS" | "Battle Royale" | "Esportes" | "Sandbox" | "MOBA" | "Outros";

export type TopicStatus = "Explodindo" | "Subindo" | "Estável" | "Caindo" | "Sem dados";

export interface RelatedProduct {
  id: string;
  name: string;
  platform: string;
  cost: number;
  price: number;
}

export interface MetricSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  value: number; // Índice de interesse (0 a 100 ou % delta)
  competitorsCount?: number;
  avgPrice?: number;
  registeredBy: string;
}

export interface TrendingTopic {
  id: string;
  name: string;
  category: CategoryType;
  gameOrPlatform: string;
  notes: string;
  relatedProducts: RelatedProduct[];
  isFollowing?: boolean;
  history: MetricSnapshot[];
  updatedAt: string;
  isExample?: boolean;
}

export interface OpportunityItem {
  id: string;
  topicId: string;
  topicName: string;
  column: "Nova" | "Testando" | "Vendendo" | "Descartada";
  suggestedProducts: {
    name: string;
    platform: string;
    cost: number;
    price: number;
    netMarginPct: number;
    risk: "Baixo" | "Médio" | "Alto";
    liquidity: number;
  }[];
  notes?: string;
  realMarginPct?: number;
  createdAt: string;
  completedAt?: string;
}

export interface TrendingEvent {
  id: string;
  topicId?: string;
  topicName?: string;
  title: string;
  startDate: string;
  endDate: string;
  category: "Patch" | "Torneio" | "Promocao" | "Temporada" | "Lancamento";
  notes?: string;
  affectsMyProducts: boolean;
  reminderDaysBefore?: number;
}

export interface TrendingAlert {
  id: string;
  topicId: string;
  topicName: string;
  type: "high_growth" | "steep_drop" | "exploding" | "outdated";
  message: string;
  date: string;
  read: boolean;
}

// Initial Mock Examples (Only shown when user has no custom data)
export const initialMockTopics: TrendingTopic[] = [
  {
    id: "top-1",
    name: "GTA VI trailer 3",
    category: "Sandbox",
    gameOrPlatform: "GTA VI / Rockstar",
    notes: "Especulação de pré-venda e chaves antecipadas.",
    relatedProducts: [
      { id: "p1", name: "Gift Card PSN R$250", platform: "ggmax", cost: 215, price: 245 },
      { id: "p2", name: "Xbox Gift Card R$200", platform: "eneba", cost: 170, price: 195 }
    ],
    isFollowing: true,
    history: [
      { id: "m1", date: "2026-10-01", value: 45, competitorsCount: 12, avgPrice: 240, registeredBy: "Sistema" },
      { id: "m2", date: "2026-10-04", value: 78, competitorsCount: 18, avgPrice: 245, registeredBy: "Sistema" },
      { id: "m3", date: "2026-10-08", value: 98, competitorsCount: 25, avgPrice: 248, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-08",
    isExample: true
  },
  {
    id: "top-2",
    name: "VALORANT Ep.10",
    category: "FPS",
    gameOrPlatform: "Valorant / Riot Games",
    notes: "Lançamento de novo ato com passe de batalha e agente.",
    relatedProducts: [
      { id: "p3", name: "Valorant Points 1000", platform: "ggmax", cost: 31, price: 42 }
    ],
    isFollowing: true,
    history: [
      { id: "m4", date: "2026-10-02", value: 30, competitorsCount: 40, avgPrice: 40, registeredBy: "Sistema" },
      { id: "m5", date: "2026-10-07", value: 85, competitorsCount: 52, avgPrice: 42, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-07",
    isExample: true
  },
  {
    id: "top-3",
    name: "FC 26 TOTY",
    category: "Esportes",
    gameOrPlatform: "EA Sports FC 26",
    notes: "Evento Team of the Year traz alto volume de abertura de pacotes.",
    relatedProducts: [
      { id: "p4", name: "FC 26 Points 2800", platform: "eneba", cost: 84, price: 119 }
    ],
    isFollowing: false,
    history: [
      { id: "m6", date: "2026-10-01", value: 40, competitorsCount: 15, avgPrice: 115, registeredBy: "Sistema" },
      { id: "m7", date: "2026-10-09", value: 92, competitorsCount: 22, avgPrice: 119, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-09",
    isExample: true
  },
  {
    id: "top-4",
    name: "LoL Worlds",
    category: "MOBA",
    gameOrPlatform: "League of Legends / Riot",
    notes: "Fase final do campeonato mundial com skins exclusivas.",
    relatedProducts: [
      { id: "p5", name: "Conta LoL Smurf Nv.30", platform: "ggmax", cost: 12, price: 35 }
    ],
    isFollowing: false,
    history: [
      { id: "m8", date: "2026-10-03", value: 50, competitorsCount: 80, avgPrice: 34, registeredBy: "Sistema" },
      { id: "m9", date: "2026-10-09", value: 75, competitorsCount: 95, avgPrice: 35, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-09",
    isExample: true
  },
  {
    id: "top-5",
    name: "Steam Autumn Sale",
    category: "Outros",
    gameOrPlatform: "Steam / Valve",
    notes: "Promoção de outono aumentando procura por Gift Cards.",
    relatedProducts: [
      { id: "p6", name: "Gift Card Steam R$50", platform: "gamemarket", cost: 49, price: 54 }
    ],
    isFollowing: false,
    history: [
      { id: "m10", date: "2026-09-25", value: 20, competitorsCount: 200, avgPrice: 53, registeredBy: "Sistema" },
      { id: "m11", date: "2026-10-02", value: 65, competitorsCount: 280, avgPrice: 54, registeredBy: "Sistema" }
    ],
    updatedAt: "2026-10-02", // Outdated (> 7 days from Oct 10)
    isExample: true
  },
  {
    id: "top-6",
    name: "Roblox Halloween",
    category: "Sandbox",
    gameOrPlatform: "Roblox / Roblox Corp",
    notes: "Evento de dia das bruxas com itens limitados.",
    relatedProducts: [
      { id: "p7", name: "Robux 800", platform: "ggmax", cost: 36, price: 46 }
    ],
    isFollowing: true,
    history: [
      { id: "m12", date: "2026-10-01", value: 40, competitorsCount: 30, avgPrice: 45, registeredBy: "Sistema" },
      { id: "m13", date: "2026-10-08", value: 70, competitorsCount: 45, avgPrice: 46, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-08",
    isExample: true
  },
  {
    id: "top-7",
    name: "CS2 Operation",
    category: "FPS",
    gameOrPlatform: "Counter-Strike 2 / Valve",
    notes: "Especulação sobre nova operação de passes.",
    relatedProducts: [
      { id: "p8", name: "Skin CS2 AK Redline FT", platform: "eneba", cost: 150, price: 189 }
    ],
    isFollowing: false,
    history: [
      { id: "m14", date: "2026-10-01", value: 60, competitorsCount: 40, avgPrice: 195, registeredBy: "Sistema" },
      { id: "m15", date: "2026-10-08", value: 50, competitorsCount: 38, avgPrice: 189, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-08",
    isExample: true
  },
  {
    id: "top-8",
    name: "Minecraft 1.22",
    category: "Sandbox",
    gameOrPlatform: "Minecraft / Mojang",
    notes: "Novo bioma anunciado no Minecraft Live.",
    relatedProducts: [],
    isFollowing: false,
    history: [
      { id: "m16", date: "2026-10-03", value: 30, competitorsCount: 10, avgPrice: 60, registeredBy: "Sistema" },
      { id: "m17", date: "2026-10-09", value: 42, competitorsCount: 15, avgPrice: 65, registeredBy: "Você" }
    ],
    updatedAt: "2026-10-09",
    isExample: true
  }
];

export const initialEvents: TrendingEvent[] = [
  {
    id: "ev-1",
    topicName: "VALORANT Ep.10",
    title: "Lançamento Episódio 10 Ato 1",
    startDate: "2026-10-15",
    endDate: "2026-10-16",
    category: "Lancamento",
    notes: "Passe de batalha renovado e novo agente",
    affectsMyProducts: true,
    reminderDaysBefore: 3
  },
  {
    id: "ev-2",
    topicName: "FC 26 TOTY",
    title: "Divulgação dos indicados TOTY",
    startDate: "2026-10-22",
    endDate: "2026-10-28",
    category: "Torneio",
    notes: "Corrida aos pacotes com desconto nas moedas",
    affectsMyProducts: true,
    reminderDaysBefore: 5
  },
  {
    id: "ev-3",
    topicName: "Steam Autumn Sale",
    title: "Abertura oficial das promoções de outono",
    startDate: "2026-11-20",
    endDate: "2026-11-27",
    category: "Promocao",
    notes: "Explosão de demanda de gift cards Steam",
    affectsMyProducts: true
  }
];

// Calculation Helpers
export function calculateTopicStatus(history: MetricSnapshot[]): { status: TopicStatus; deltaPct: number } {
  if (!history || history.length === 0) return { status: "Sem dados", deltaPct: 0 };
  if (history.length === 1) return { status: "Estável", deltaPct: 0 };

  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const oldest = sorted[0]?.value ?? 0;
  const latest = sorted[sorted.length - 1]?.value ?? 0;

  if (oldest === 0) return { status: latest > 0 ? "Subindo" : "Estável", deltaPct: 0 };

  const deltaPct = Math.round(((latest - oldest) / oldest) * 100);

  let status: TopicStatus = "Estável";
  if (deltaPct >= 100) status = "Explodindo";
  else if (deltaPct > 15) status = "Subindo";
  else if (deltaPct < -15) status = "Caindo";
  else status = "Estável";

  return { status, deltaPct };
}

export function isTopicOutdated(updatedAt: string): boolean {
  if (!updatedAt) return true;
  const now = new Date("2026-10-10").getTime(); // Reference date in app
  const updated = new Date(updatedAt).getTime();
  const diffDays = (now - updated) / (1000 * 3600 * 24);
  return diffDays > 7;
}

export function calculateConfidence(history: MetricSnapshot[], updatedAt: string): number {
  if (!history || history.length === 0) return 0;
  const countScore = Math.min(50, history.length * 15);
  const isOut = isTopicOutdated(updatedAt);
  const recencyScore = isOut ? 20 : 50;
  return countScore + recencyScore;
}
