export type Verdict = "INVESTIR" | "TESTAR" | "EVITAR";

export interface Platform {
  id: string;
  name: string;
  fee: number; // % taxa da plataforma
  payment: number; // % taxa de pagamento
}

export const platforms: Platform[] = [
  { id: "ggmax", name: "GGMAX", fee: 12, payment: 2.5 },
  { id: "eneba", name: "Eneba", fee: 10, payment: 3 },
  { id: "gamemarket", name: "Gamemarket", fee: 11, payment: 2 },
  { id: "ml", name: "Mercado Livre", fee: 16, payment: 0 },
];

export interface Product {
  id: string;
  name: string;
  category: string;
  platform: string;
  price: number;
  cost: number;
  demand: number; // 0-100
  competition: number; // 0-100 (alto = ruim)
  risk: number; // 0-100 (alto = ruim)
  liquidity: number; // 0-100
  timing: number; // 0-100
  trend: "subindo" | "estável" | "caindo";
  sellers: number;
  confidence: number;
  history: number[];
  why: string;
  sources: string[];
  missing?: string;
}

export const products: Product[] = [
  { id: "vp-1000", name: "Valorant Points 1000", category: "Moedas", platform: "ggmax", price: 42, cost: 31, demand: 82, competition: 55, risk: 18, liquidity: 88, timing: 74, trend: "subindo", sellers: 146, confidence: 78,
    history: [38, 39, 39, 40, 41, 40, 42, 43, 42, 44, 45, 44],
    why: "Demanda subindo com o novo Episódio. Margem fina mas giro alto: o dinheiro volta em menos de 48h. Concorrência grande, então o ganho vem de volume, não de preço. Entre agora com lote pequeno e reponha conforme vender.",
    sources: ["Snapshots manuais GGMAX (12)", "Google Trends BR"] },
  { id: "fc-points", name: "FC 26 Points 2800", category: "Moedas", platform: "eneba", price: 119, cost: 84, demand: 76, competition: 40, risk: 22, liquidity: 70, timing: 81, trend: "subindo", sellers: 58, confidence: 71,
    history: [102, 104, 108, 107, 110, 112, 115, 114, 116, 118, 119, 121],
    why: "Janela do Team of the Year se aproxima e historicamente puxa a demanda em 30–45%. Margem saudável e poucos vendedores sérios. O risco principal é chargeback em compras de valor alto; exija verificação.",
    sources: ["Histórico de vendas importado (CSV)", "Calendário EA"] },
  { id: "steam-50", name: "Gift Card Steam R$50", category: "Gift cards", platform: "gamemarket", price: 54, cost: 49, demand: 70, competition: 85, risk: 35, liquidity: 80, timing: 50, trend: "estável", sellers: 312, confidence: 84,
    history: [54, 54, 53, 54, 55, 54, 54, 53, 54, 54, 54, 54],
    why: "Guerra de preço: 312 vendedores e margem abaixo de 5% depois das taxas. Só faz sentido como produto de entrada para atrair cliente. Não use como fonte de lucro.",
    sources: ["Snapshots manuais Gamemarket (20)"] },
  { id: "acc-lol", name: "Conta LoL Smurf Nv.30", category: "Contas", platform: "ggmax", price: 35, cost: 12, demand: 64, competition: 60, risk: 82, liquidity: 58, timing: 40, trend: "caindo", sellers: 201, confidence: 66,
    history: [48, 46, 45, 44, 42, 41, 40, 38, 37, 36, 35, 35],
    why: "Margem bonita no papel, mas venda de contas viola os termos da Riot e as ondas de banimento recentes geram reembolso. Preço caindo há 12 semanas. Risco de reputação maior que o ganho.",
    sources: ["Snapshots manuais GGMAX (9)", "Termos de serviço Riot"], missing: "Taxa de reembolso real das suas vendas" },
  { id: "robux-800", name: "Robux 800", category: "Moedas", platform: "ggmax", price: 46, cost: 36, demand: 72, competition: 50, risk: 30, liquidity: 76, timing: 62, trend: "estável", sellers: 97, confidence: 69,
    history: [44, 45, 45, 46, 46, 45, 46, 47, 46, 46, 46, 46],
    why: "Público jovem e recorrente, ticket baixo e estável. Margem razoável. Vale testar com anúncio focado em entrega rápida e verificar se a recompra se confirma.",
    sources: ["Snapshots manuais GGMAX (7)"], missing: "Dados de recompra" },
  { id: "skin-cs", name: "Skin CS2 AK Redline FT", category: "Skins", platform: "eneba", price: 189, cost: 150, demand: 58, competition: 45, risk: 48, liquidity: 42, timing: 55, trend: "estável", sellers: 34, confidence: 52,
    history: [176, 181, 179, 185, 190, 186, 188, 192, 187, 189, 191, 189],
    why: "Margem boa, mas liquidez baixa: o capital fica parado em média 9 dias. Volatilidade ligada a atualizações da Valve. Teste uma unidade antes de montar estoque.",
    sources: ["Snapshots manuais Eneba (5)"], missing: "Série de preços com mais de 30 dias" },
];

export const weights = { demand: 25, margin: 25, competition: 15, risk: 15, liquidity: 10, timing: 10 };
export const TAX = 6; // % imposto padrão (Simples) — configurável

export function netMargin(price: number, cost: number, platformId: string, tax = TAX) {
  const p = (platforms.find((x) => x.id === platformId) ?? platforms[0])!;
  const fees = price * ((p.fee + p.payment + tax) / 100);
  const profit = price - fees - cost;
  return { profit, pct: price > 0 ? (profit / price) * 100 : 0, fees };
}

export function score(pr: Pick<Product, "price" | "cost" | "platform" | "demand" | "competition" | "risk" | "liquidity" | "timing">) {
  const m = netMargin(pr.price, pr.cost, pr.platform).pct;
  const marginScore = Math.max(0, Math.min(100, m * 3));
  const s =
    (pr.demand * weights.demand +
      marginScore * weights.margin +
      (100 - pr.competition) * weights.competition +
      (100 - pr.risk) * weights.risk +
      pr.liquidity * weights.liquidity +
      pr.timing * weights.timing) /
    100;
  return Math.round(s);
}

export function verdict(s: number, risk: number): Verdict {
  if (risk >= 75) return "EVITAR";
  if (s >= 65) return "INVESTIR";
  if (s >= 48) return "TESTAR";
  return "EVITAR";
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const trending = [
  { tag: "VALORANT Ep.10", delta: +184 },
  { tag: "FC 26 TOTY", delta: +142 },
  { tag: "Steam Autumn Sale", delta: +96 },
  { tag: "GTA VI trailer 3", delta: +310 },
  { tag: "Roblox Halloween", delta: +77 },
  { tag: "CS2 Operation", delta: -12 },
  { tag: "Minecraft 1.22", delta: +41 },
  { tag: "LoL Worlds", delta: +128 },
];

export interface Advisor {
  id: string;
  name: string;
  short: string;
  area: string;
  persona: string;
  initials: string;
  keywords: string[];
}

export const advisors: Advisor[] = [
  { id: "helena", short: "Helena", name: "Dra. Helena Cordeiro", area: "Financeiro", persona: "Cética, seca, obcecada por caixa", initials: "HC", keywords: ["margem", "caixa", "lucro", "custo", "imposto", "mei", "simples", "capital", "preço", "dinheiro", "roi"] },
  { id: "rafael", short: "Rafael", name: "Dr. Rafael Menezes", area: "Jurídico", persona: "Cauteloso, preciso, calmo", initials: "RM", keywords: ["termos", "lei", "lgpd", "contrato", "marca", "cdc", "jurídico", "processo", "regras", "permitido"] },
  { id: "bruno", short: "Bruno", name: 'Bruno "Byte" Takahashi', area: "Automação", persona: "Pragmático, odeia complexidade inútil", initials: "BT", keywords: ["api", "automação", "bot", "sistema", "integração", "código", "automatizar"] },
  { id: "icaro", short: "Ícaro", name: "Prof. Ícaro Valadares", area: "Estatística", persona: "Analítico, ácido com números mal usados", initials: "IV", keywords: ["probabilidade", "amostra", "estatística", "previsão", "média", "chance", "dados"] },
  { id: "marina", short: "Marina", name: "Marina Duarte", area: "Marketing e vendas", persona: "Enérgica, orientada a conversão", initials: "MD", keywords: ["anúncio", "copy", "venda", "cliente", "instagram", "funil", "título", "vender", "marketing"] },
  { id: "ze", short: "Zé", name: "Seu Zé Antunes", area: "Operação e antifraude", persona: "Veterano, desconfiado, fala simples", initials: "ZA", keywords: ["golpe", "ban", "chargeback", "fornecedor", "fraude", "entrega", "reembolso", "seguro"] },
  { id: "lucia", short: "Lúcia", name: "Dra. Lúcia Prado", area: "Decisão / advogada do diabo", persona: "Provocadora, incômoda", initials: "LP", keywords: ["certeza", "tenho certeza", "vai dar certo", "decidir", "dúvida", "fomo", "medo"] },
];

export function route(text: string): { ids: string[]; reason: string } {
  const lower = text.toLowerCase();
  const mentions = [...lower.matchAll(/@(\p{L}+)/gu)].map((m) => m[1]);
  if (mentions.includes("todos")) return { ids: advisors.map((a) => a.id), reason: "@todos: opinião de cada conselheiro ativo" };
  const mentioned = advisors.filter((a) => mentions.some((m) => a.short.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "") === (m ?? "").normalize("NFD").replace(/\p{M}/gu, "")));
  if (mentioned.length) return { ids: mentioned.map((a) => a.id), reason: "Menção direta com @" };
  const scored = advisors
    .map((a) => ({ a, n: a.keywords.filter((k) => lower.includes(k)).length }))
    .filter((x) => x.n > 0)
    .sort((x, y) => y.n - x.n)
    .slice(0, 2);
  if (!scored.length) return { ids: [], reason: "" };
  return { ids: scored.map((x) => x.a.id), reason: `tema de ${scored.map((x) => x.a.area.toLowerCase()).join(" e ")}` };
}
