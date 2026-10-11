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
  topicId?: string | undefined;
  topicName?: string | undefined;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  category: "Patch" | "Torneio" | "Promocao" | "Temporada" | "Lancamento" | "IA & Tech" | "Sazonal";
  notes?: string | undefined;
  opportunityAction?: string | undefined;
  monetizationPotential?: "Altíssimo" | "Alto" | "Médio" | undefined;
  affectsMyProducts: boolean;
  reminderDaysBefore?: number | undefined;
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
    topicName: "xAI / Grok 3",
    title: "Prévia de Lançamento xAI Grok 3 Vision & API Multimodal",
    startDate: "2026-10-11",
    endDate: "2026-10-12",
    category: "IA & Tech",
    notes: "Anúncio do Elon Musk sobre novas capacidades de agentes autônomos em tempo real.",
    opportunityAction: "Desenvolver conectores de automação de suporte e IA para lojas virtuais.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 1
  },
  {
    id: "ev-2",
    topicName: "E-commerce Brasil",
    title: "Prime Day / Mega Ofertas de Primavera",
    startDate: "2026-10-13",
    endDate: "2026-10-15",
    category: "Promocao",
    notes: "Aumento de 240% em buscas de eletrônicos, gift cards e assinaturas digitais.",
    opportunityAction: "Escalar campanhas de tráfego pago em produtos de ticket médio e margem líquida acima de 25%.",
    monetizationPotential: "Alto",
    affectsMyProducts: true,
    reminderDaysBefore: 2
  },
  {
    id: "ev-3",
    topicName: "VALORANT Ep.10",
    title: "Lançamento Oficial Episódio 10 Ato 1 & Passe",
    startDate: "2026-10-15",
    endDate: "2026-10-16",
    category: "Lancamento",
    notes: "Passe de batalha renovado, novo agente e nova linha de skins premium.",
    opportunityAction: "Garantir estoque de Riot Points / Gift Cards Valorant nas plataformas GGMAX e Eneba.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 3
  },
  {
    id: "ev-4",
    topicName: "Autonomous Agents",
    title: "Hackathon Global de Agentes Autônomos de IA",
    startDate: "2026-10-18",
    endDate: "2026-10-20",
    category: "IA & Tech",
    notes: "Pico de novos micro-SaaS e repositórios de código open source viralizando no X.",
    opportunityAction: "Mapear ferramentas open source virais e empacotar como solução 'no-code' para empresas.",
    monetizationPotential: "Alto",
    affectsMyProducts: false
  },
  {
    id: "ev-5",
    topicName: "FC 26 TOTY",
    title: "Divulgação dos Indicados Oficiais TOTY (Team of the Year)",
    startDate: "2026-10-22",
    endDate: "2026-10-28",
    category: "Torneio",
    notes: "Corrida aos pacotes com desconto nas moedas e contas farmadas.",
    opportunityAction: "Aumentar estoque de moedas FC e contas com mercado aberto no WebApp.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 5
  },
  {
    id: "ev-6",
    topicName: "OpenAI Ecosystem",
    title: "OpenAI Autumn Keynote (Modelos de Voz e Raciocínio O3)",
    startDate: "2026-10-25",
    endDate: "2026-10-26",
    category: "IA & Tech",
    notes: "Novidades sobre agentes de voz ultrarrealistas e ferramentas para desenvolvedores.",
    opportunityAction: "Oferecer soluções de atendimento telefônico automatizado para clínicas e comércios locais.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: false,
    reminderDaysBefore: 2
  },
  {
    id: "ev-7",
    topicName: "Steam Games",
    title: "Steam Scream Fest (Edição Halloween)",
    startDate: "2026-10-28",
    endDate: "2026-11-02",
    category: "Promocao",
    notes: "Promoções agressivas de jogos de terror e multiplayer de sobrevivência.",
    opportunityAction: "Venda rápida de Gift Cards Steam R$50 e R$100 com margem líquida de 8-12%.",
    monetizationPotential: "Médio",
    affectsMyProducts: true,
    reminderDaysBefore: 2
  },
  {
    id: "ev-8",
    topicName: "Roblox / Halloween",
    title: "Roblox Spooky Celebration & Eventos de Comunidade",
    startDate: "2026-10-31",
    endDate: "2026-11-03",
    category: "Sazonal",
    notes: "Itens cosméticos limitados gerando alta liquidez nas comunidades de troca.",
    opportunityAction: "Promover pacotes de Robux 800 e 2.000 com entrega imediata automatizada.",
    monetizationPotential: "Alto",
    affectsMyProducts: true
  },
  {
    id: "ev-9",
    topicName: "Black November",
    title: "Abertura Oficial do 'Esquenta Black Friday' Shopee & ML",
    startDate: "2026-11-05",
    endDate: "2026-11-10",
    category: "Promocao",
    notes: "Marketplaces começam a liberar cupons de frete grátis e cashback agressivo.",
    opportunityAction: "Cadastrar kits de produtos de alta liquidez e ativar precificação dinâmica competitiva.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 4
  },
  {
    id: "ev-10",
    topicName: "Tesla / xAI",
    title: "Tesla AI Day & Apresentação Optimus Gen 3 (Elon Musk)",
    startDate: "2026-11-08",
    endDate: "2026-11-09",
    category: "IA & Tech",
    notes: "Transmissão ao vivo mundial de Elon Musk sobre visão computacional e robótica.",
    opportunityAction: "Criar conteúdo e criativos de anúncios aproveitando os tópicos mais comentados do X.",
    monetizationPotential: "Alto",
    affectsMyProducts: false
  },
  {
    id: "ev-11",
    topicName: "Global E-commerce",
    title: "Single's Day 11.11 (Maior Festival de Vendas Global)",
    startDate: "2026-11-11",
    endDate: "2026-11-12",
    category: "Promocao",
    notes: "AliExpress, Shopee e Shein com descontos de até 80% e queima de estoques asiáticos.",
    opportunityAction: "Arbitragem de eletrônicos e compras de chaves globais com deságio cambial.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 5
  },
  {
    id: "ev-12",
    topicName: "Fortnite OG",
    title: "Fortnite Capítulo 6 / Nova Temporada & Passe de Batalha",
    startDate: "2026-11-14",
    endDate: "2026-11-16",
    category: "Lancamento",
    notes: "Renovação completa do mapa e cosméticos exclusivos de fim de ano.",
    opportunityAction: "Disparar ofertas de V-Bucks e pacotes de skins nas redes sociais e grupos VIP.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 3
  },
  {
    id: "ev-13",
    topicName: "AI Workflows",
    title: "Conferência Global de Agentes de Vendas B2B & WhatsApp IA",
    startDate: "2026-11-18",
    endDate: "2026-11-19",
    category: "IA & Tech",
    notes: "Novos frameworks de agentes de conversão autônoma no WhatsApp e Instagram Direct.",
    opportunityAction: "Plugar scripts de recuperação de vendas de carrinho abandonado com IA.",
    monetizationPotential: "Alto",
    affectsMyProducts: true
  },
  {
    id: "ev-14",
    topicName: "Steam Autumn Sale",
    title: "Abertura Oficial das Promoções de Outono da Valve",
    startDate: "2026-11-20",
    endDate: "2026-11-27",
    category: "Promocao",
    notes: "Explosão de demanda de gift cards Steam em todas as plataformas.",
    opportunityAction: "Manter estoque abastecido de cartões de R$50 a R$200 com margem mínima de 10%.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 7
  },
  {
    id: "ev-15",
    topicName: "Black Friday",
    title: "Semana Oficial da Black Friday 2026",
    startDate: "2026-11-24",
    endDate: "2026-11-26",
    category: "Promocao",
    notes: "Pico de tráfego orgânico e pesquisas no Google Trends no Brasil.",
    opportunityAction: "Foco total em produtos estrela de giro rápido e entrega 100% automatizada.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 7
  },
  {
    id: "ev-16",
    topicName: "Black Friday",
    title: "BLACK FRIDAY 2026 (Dia D do E-commerce Nacional)",
    startDate: "2026-11-27",
    endDate: "2026-11-28",
    category: "Promocao",
    notes: "Maior volume de faturamento do ano no comércio digital brasileiro.",
    opportunityAction: "Ofertas relâmpago, combos com produtos de margem elástica e suporte 24h.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 10
  },
  {
    id: "ev-17",
    topicName: "Cyber Monday",
    title: "CYBER MONDAY 2026 (Foco em Eletrônicos & Softwares)",
    startDate: "2026-11-30",
    endDate: "2026-12-01",
    category: "Promocao",
    notes: "Última oportunidade de queima de estoque digital de tecnologia com alta conversão.",
    opportunityAction: "Liquidação de licenças, softwares de produtividade e periféricos gamer.",
    monetizationPotential: "Alto",
    affectsMyProducts: true,
    reminderDaysBefore: 3
  },
  {
    id: "ev-18",
    topicName: "Natal Digital",
    title: "Início da Campanha de Natal 'Presentes Digitais Instantâneos'",
    startDate: "2026-12-02",
    endDate: "2026-12-04",
    category: "Sazonal",
    notes: "Buscas por presentes de última hora sem depender de frete e prazos dos Correios.",
    opportunityAction: "Vender 'Cartões Presente Digitais' com envio instantâneo por e-mail ou WhatsApp.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true
  },
  {
    id: "ev-19",
    topicName: "CS2 Winter Major",
    title: "Playoffs CS2 Winter Major & Cápsulas de Adesivos",
    startDate: "2026-12-05",
    endDate: "2026-12-07",
    category: "Torneio",
    notes: "Adesivos de equipes e autógrafos de jogadores com valorização especulativa no mercado da Steam.",
    opportunityAction: "Comprar cápsulas com desconto de 75% no final do evento para retenção estratégica.",
    monetizationPotential: "Alto",
    affectsMyProducts: true,
    reminderDaysBefore: 4
  },
  {
    id: "ev-20",
    topicName: "Gaming & Pop Culture",
    title: "The Game Awards 2026 (Transmissão Global de Anúncios)",
    startDate: "2026-12-08",
    endDate: "2026-12-09",
    category: "Lancamento",
    notes: "Revelação de novos jogos AAA, trailers mundiais e ofertas surpresa de parceiros.",
    opportunityAction: "Monitorar anúncios em tempo real para cadastrar pré-vendas e chaves digitais na mesma noite.",
    monetizationPotential: "Alto",
    affectsMyProducts: false
  },
  {
    id: "ev-21",
    topicName: "Economia Brasil",
    title: "Liberação da 1ª Parcela do 13º Salário e Picos de Consumo",
    startDate: "2026-12-10",
    endDate: "2026-12-12",
    category: "Sazonal",
    notes: "Entrada massiva de capital na conta dos trabalhadores brasileiros, elevando o ticket médio das compras.",
    opportunityAction: "Subir os preços médios de produtos premium e lançar bundles de maior valor agregado.",
    monetizationPotential: "Altíssimo",
    affectsMyProducts: true,
    reminderDaysBefore: 5
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
