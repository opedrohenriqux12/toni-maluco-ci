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

// Dados reais cadastrados pelo usuário ou gerados via IA
export const initialMockTopics: TrendingTopic[] = [];

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
