import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart, Cell } from "recharts";
import { ChevronDown, Users, Flame, Bell, Sparkles, Gauge, Wallet } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { VerdictBadge, CountUp } from "@/components/Verdict";
import { products, platforms, score, verdict, netMargin, brl, trending, type Product } from "@/lib/data";
import { GestaoDashboard } from "@/components/GestaoDashboard";
import { useCentralModo, setCentralModo } from "@/lib/modo";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { modo?: "operacao" | "gestao" | undefined; aba?: string | undefined } => ({
    modo: (search["modo"] as "operacao" | "gestao") || undefined,
    aba: typeof search["aba"] === "string" ? (search["aba"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Central de Decisão — ToniMaluco C.I" },
      { name: "description", content: "Ranking de oportunidades com score, veredito e o porquê de cada decisão." },
      { property: "og:title", content: "Central de Decisão — ToniMaluco C.I" },
      { property: "og:description", content: "Ranking de oportunidades com score, veredito e o porquê de cada decisão." },
    ],
  }),
  component: Dashboard,
});

function Spark({ data, color = "var(--primary)" }: { data: number[]; color?: string | undefined }) {
  const d = data.map((v, i) => ({ i, v }));
  const id = `g${Math.abs(data.reduce((a, b) => a + b, 0))}${color.length}`;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const glassTip = { background: "color-mix(in oklab, var(--card) 85%, transparent)", border: "1px solid var(--border)", borderRadius: 10, backdropFilter: "blur(12px)", fontSize: 12 };

function Dashboard() {
  const { modo, aba } = useCentralModo();
  const [plat, setPlat] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(products[0]?.id ?? null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active as HTMLElement)?.isContentEditable;

      if (!isInput && (e.key === "g" || e.key === "G")) {
        e.preventDefault();
        setCentralModo(modo === "operacao" ? "gestao" : "operacao");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modo]);

  const ranked = useMemo(
    () =>
      products
        .filter((p) => plat === "all" || p.platform === plat)
        .map((p) => {
          const s = score(p);
          return { ...p, s, v: verdict(s, p.risk), m: netMargin(p.price, p.cost, p.platform) };
        })
        .sort((a, b) => b.s - a.s),
    [plat],
  );
  const avg = Math.round(ranked.reduce((a, b) => a + b.s, 0) / Math.max(1, ranked.length));
  const profit = ranked.reduce((a, b) => a + b.m.profit * 40, 0);

  const kpis = [
    { label: "Lucro estimado no mês", value: profit, fmt: brl, icon: Wallet, data: [3, 4, 4, 5, 6, 5, 7, 8] },
    { label: "Produtos em alta", value: ranked.filter((p) => p.trend === "subindo").length, icon: Flame, data: [1, 2, 2, 3, 2, 3, 4, 3] },
    { label: "Alertas ativos", value: ranked.filter((p) => p.risk > 60).length + 2, icon: Bell, data: [2, 1, 3, 2, 4, 3, 3, 3], color: "var(--test)" },
    { label: "Oportunidades novas", value: 4, icon: Sparkles, data: [0, 1, 1, 2, 2, 3, 3, 4], color: "var(--invest)" },
    { label: "Score médio", value: avg, icon: Gauge, data: [52, 55, 54, 58, 60, 59, 61, avg] },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          kicker={modo === "operacao" ? "Central de Decisão" : "Gestão Financeira"}
          title={modo === "operacao" ? "Mercado aberto. Três movimentos pra você olhar." : "Gestão. Como o negócio está de verdade."}
        >
          {modo === "operacao"
            ? "Cada recomendação vem com números, motivo e nível de confiança. Se faltar dado, o sistema avisa."
            : "DRE resumida, fluxo de caixa, rentabilidade real e histórico de transações auditadas."}
        </PageTitle>

        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1.5 backdrop-blur-md self-start sm:self-center">
          <button
            onClick={() => setCentralModo("operacao")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              modo === "operacao"
                ? "border border-primary/40 bg-primary/15 text-primary shadow-sm glow"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" />
            Operação
          </button>
          <button
            onClick={() => setCentralModo("gestao")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              modo === "gestao"
                ? "border border-primary/40 bg-primary/15 text-primary shadow-sm glow"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            Gestão
            <kbd className="ml-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">G</kbd>
          </button>
        </div>
      </div>

      {modo === "operacao" ? (
        <>
          <div className="glass mb-6 overflow-hidden py-2">
            <div className="ticker flex w-max gap-8 whitespace-nowrap">
              {[...trending, ...trending].map((t, i) => (
                <span key={i} className="num text-xs">
                  <span className="text-muted-foreground">{t.tag}</span>{" "}
                  <span className={t.delta >= 0 ? "text-invest" : "text-avoid"}>{t.delta >= 0 ? "▲" : "▼"} {Math.abs(t.delta)}%</span>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {kpis.map((k, i) => (
              <div key={k.label} className="glass rise p-4 transition hover:-translate-y-0.5 hover:glow" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {k.label} <k.icon className="h-3.5 w-3.5" />
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  <CountUp value={k.value} format={k.fmt ?? ((n) => Math.round(n).toString())} />
                </div>
                <Spark data={k.data} color={k.color} />
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <h2 className="mr-auto text-xl font-bold">Ranking de oportunidades</h2>
            {[{ id: "all", name: "Todas" }, ...platforms].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlat(p.id)}
                className={`rounded-full border px-3 py-1 text-xs transition ${plat === p.id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {ranked.length === 0 && <div className="glass p-8 text-center text-sm text-muted-foreground">Sem dados dessa plataforma ainda. Quer importar um CSV?</div>}
            {ranked.map((p, i) => (
              <ProductCard key={p.id} p={p} rank={i + 1} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} />
            ))}
          </div>
        </>
      ) : (
        <GestaoDashboard activeAba={aba} />
      )}
    </div>
  );
}

type Ranked = Product & { s: number; v: ReturnType<typeof verdict>; m: ReturnType<typeof netMargin> };

function ProductCard({ p, rank, open, onToggle }: { p: Ranked; rank: number; open: boolean; onToggle: () => void }) {
  const plat = platforms.find((x) => x.id === p.platform)!;
  const byPlat = platforms.map((pl) => ({ name: pl.name, m: Math.round(netMargin(p.price, p.cost, pl.id).pct) }));
  const hist = p.history.map((v, i) => ({ s: `S${i + 1}`, v }));
  const color = p.v === "INVESTIR" ? "var(--invest)" : p.v === "TESTAR" ? "var(--test)" : "var(--avoid)";

  return (
    <div className={`glass rise transition-all duration-300 ${open ? "glow" : "hover:border-primary/30"}`} style={{ animationDelay: `${rank * 50}ms` }}>
      <button onClick={onToggle} className="flex w-full items-center gap-4 p-4 text-left">
        <span className="num w-6 text-sm text-muted-foreground">{String(rank).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display font-semibold">{p.name}</div>
          <div className="text-xs text-muted-foreground">{p.category} · {plat.name} · tendência {p.trend}</div>
        </div>
        <div className="hidden w-28 sm:block"><Spark data={p.history} color={color} /></div>
        <div className="hidden text-right md:block">
          <div className="num text-sm">{brl(p.m.profit)}</div>
          <div className="num text-xs text-muted-foreground">{p.m.pct.toFixed(1)}% líq.</div>
        </div>
        <div className="num w-10 text-right text-xl font-semibold" style={{ color }}>{p.s}</div>
        <VerdictBadge v={p.v} />
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="num text-[11px] uppercase tracking-widest text-primary">Insight · Por que {p.v === "EVITAR" ? "não" : "investir"}?</p>
              <p className="mt-2 text-sm leading-relaxed">{p.why}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Demanda", p.demand], ["Concorrência", p.competition], ["Risco", p.risk], ["Liquidez", p.liquidity],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-lg border border-border p-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="num mt-0.5 text-base">{v}<span className="text-muted-foreground">/100</span></dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="text-foreground">Confiança {p.confidence}%</span> · {p.sources.join(" · ")} · {p.sellers} vendedores
              </p>
              {p.missing && <p className="mt-1 text-xs text-test">Falta dado: {p.missing}</p>}
              <Link to="/conselho" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary/20">
                <Users className="h-3.5 w-3.5" /> Levar ao Conselho
              </Link>
            </div>
            <div className="glass p-3">
              <p className="mb-2 text-xs text-muted-foreground">Preço histórico (12 semanas) · <span className="text-primary">fato</span></p>
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={hist}>
                  <defs>
                    <linearGradient id={`h${p.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="s" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} width={32} domain={["dataMin - 3", "dataMax + 3"]} />
                  <Tooltip contentStyle={glassTip} formatter={(v: number) => brl(v)} />
                  <Area dataKey="v" stroke="var(--primary)" strokeWidth={1.5} fill={`url(#h${p.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass p-3">
              <p className="mb-2 text-xs text-muted-foreground">Margem líquida por plataforma · <span className="text-test">estimativa</span></p>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={byPlat}>
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} width={28} unit="%" />
                  <Tooltip contentStyle={glassTip} cursor={{ fill: "var(--accent)" }} formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="m" radius={[6, 6, 0, 0]}>
                    {byPlat.map((b) => <Cell key={b.name} fill={b.m >= 20 ? "var(--invest)" : b.m >= 8 ? "var(--primary)" : "var(--avoid)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
