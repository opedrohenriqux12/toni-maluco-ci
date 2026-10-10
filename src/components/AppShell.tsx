import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { 
  LayoutDashboard, Calculator, Megaphone, MessagesSquare, Users, TrendingUp, Search, Command, BrainCircuit,
  BarChart3, Wallet, Receipt, Scale, CheckSquare, PieChart as PieIcon, Package, Truck, Target, Sliders, ShieldAlert,
  Compass, Calendar, AlertTriangle, Star, Bell, FileText, BookOpen, Settings, ChevronDown, ChevronRight, Gauge
} from "lucide-react";
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from "@/components/ui/command";
import { products } from "@/lib/data";
import { useCentralModo, setCentralModo, type CentralModo } from "@/lib/modo";

const operacaoNav = [
  { to: "/", label: "Central", icon: LayoutDashboard },
  { to: "/inteligencia", label: "Inteligência", icon: BrainCircuit },
  { to: "/calculadora", label: "Calculadora", icon: Calculator },
  { to: "/anuncios", label: "Anúncios", icon: Megaphone },
  { to: "/scripts", label: "Scripts", icon: MessagesSquare },
  { to: "/trending", label: "Trending", icon: TrendingUp },
  { to: "/conselho", label: "Conselho", icon: Users },
  { to: "/gerenciamento", label: "Gerenciamento", icon: Gauge },
] as const;

interface GestaoGroup {
  title: string;
  items: Array<{
    id: string;
    label: string;
    icon: any;
    badge?: number | string;
  }>;
}

const gestaoNavGroups: GestaoGroup[] = [
  {
    title: "VISÃO GERAL",
    items: [
      { id: "painel", label: "Painel Executivo", icon: LayoutDashboard },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { id: "dre", label: "DRE e resultados", icon: BarChart3 },
      { id: "fluxo-caixa", label: "Fluxo de caixa", icon: TrendingUp },
      { id: "contas-plataformas", label: "Contas e plataformas", icon: Wallet },
      { id: "custos-despesas", label: "Custos e despesas", icon: Receipt },
      { id: "impostos-retiradas", label: "Impostos e retiradas", icon: Scale },
      { id: "conciliacao", label: "Conciliação", icon: CheckSquare },
    ],
  },
  {
    title: "RENTABILIDADE E ESTOQUE",
    items: [
      { id: "rentabilidade", label: "Rentabilidade por produto", icon: PieIcon },
      { id: "estoque-parado", label: "Estoque e capital parado", icon: Package },
      { id: "fornecedores", label: "Fornecedores", icon: Truck },
    ],
  },
  {
    title: "ESTRATÉGIA",
    items: [
      { id: "metas-okrs", label: "Metas e OKRs", icon: Target },
      { id: "cenarios", label: "Planejamento e cenários", icon: Sliders },
      { id: "risco-concentracao", label: "Portfólio e risco", icon: ShieldAlert },
      { id: "mapa-mercado", label: "Mapa de mercado", icon: Compass },
      { id: "calendario", label: "Calendário estratégico", icon: Calendar },
    ],
  },
  {
    title: "CONTROLE E RISCO",
    items: [
      { id: "riscos-conformidade", label: "Riscos e conformidade", icon: AlertTriangle, badge: 2 },
      { id: "reputacao", label: "Reputação", icon: Star },
      { id: "alertas-gestao", label: "Alertas de gestão", icon: Bell, badge: 3 },
    ],
  },
  {
    title: "DECISÃO",
    items: [
      { id: "conselho-estrategico", label: "Conselho estratégico", icon: Users },
      { id: "relatorios", label: "Relatórios", icon: FileText },
      { id: "diario-decisoes", label: "Diário de decisões", icon: BookOpen },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { id: "configuracoes", label: "Configurações do negócio", icon: Settings },
    ],
  },
];

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-lg font-bold tracking-tight">ToniMaluco</span>
      <span className="glass glow rounded-md px-1.5 py-0.5 font-display text-xs font-bold text-primary">C.I</span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { modo, aba } = useCentralModo();
  const navigate = useNavigate();

  // Collapsed groups state for Gestão sidebar
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSelectGestaoAba = (abaId: string) => {
    setCentralModo("gestao", abaId);
    navigate({ to: "/", search: { modo: "gestao", aba: abaId } });
  };

  const handleSelectOperacaoModo = (path: string = "/") => {
    setCentralModo("operacao");
    navigate({ to: path, search: { modo: "operacao" } });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/70 p-4 backdrop-blur-xl md:flex overflow-y-auto scrollbar-thin">
        <Logo />

        {/* Mode Selector Segmented Toggle */}
        <div className="mt-4 flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 backdrop-blur-md">
          <button
            onClick={() => handleSelectOperacaoModo("/")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              modo === "operacao"
                ? "border border-primary/40 bg-primary/20 text-primary glow shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" /> Operação
          </button>
          <button
            onClick={() => handleSelectGestaoAba(aba || "painel")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              modo === "gestao"
                ? "border border-primary/40 bg-primary/20 text-primary glow shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            <Wallet className="h-3.5 w-3.5" /> Gestão
          </button>
        </div>

        {/* OPERAÇÃO SIDEBAR MENU */}
        {modo === "operacao" ? (
          <nav className="mt-6 flex flex-col gap-1 transition-all duration-300">
            {operacaoNav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                search={{ modo: "operacao" }}
                activeOptions={{ exact: n.to === "/" }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-sidebar-accent hover:text-foreground"
                activeProps={{ className: "bg-sidebar-accent text-primary glow font-semibold" }}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
        ) : (
          /* GESTÃO SIDEBAR MENU */
          <nav className="mt-6 flex flex-col gap-4 transition-all duration-300 text-xs">
            {gestaoNavGroups.map((group) => {
              const isCollapsed = collapsedGroups[group.title];
              return (
                <div key={group.title} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="flex w-full items-center justify-between text-[10px] font-bold tracking-widest text-muted-foreground uppercase px-2 py-1 hover:text-foreground transition"
                  >
                    <span>{group.title}</span>
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-0.5 pl-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = aba === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectGestaoAba(item.id)}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-all ${
                              isActive
                                ? "bg-sidebar-accent text-primary glow font-semibold border border-primary/30"
                                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </span>
                            {item.badge && (
                              <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-400">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <p className="mt-auto pt-6 text-[10px] leading-relaxed text-muted-foreground/80 border-t border-sidebar-border">
          Análises são estimativas para apoio à decisão, não garantia de resultado nem aconselhamento financeiro, contábil ou jurídico.
        </p>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/60 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="md:hidden flex items-center gap-3">
            <Logo />
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1 text-[11px]">
              <button onClick={() => handleSelectOperacaoModo("/")} className={`px-2 py-0.5 rounded ${modo === "operacao" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}>Op</button>
              <button onClick={() => handleSelectGestaoAba(aba || "painel")} className={`px-2 py-0.5 rounded ${modo === "gestao" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}>Gestão</button>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="glass ml-auto flex w-full max-w-md items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground md:ml-0"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Buscar produto, módulo ({modo === "gestao" ? "Gestão" : "Operação"}) ou conselheiro…</span>
            <kbd className="num hidden items-center gap-1 rounded border border-border px-1.5 text-[10px] sm:flex"><Command className="h-3 w-3" />K</kbd>
          </button>
          
          <span className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-invest" /> Modo: <span className="font-bold text-primary uppercase">{modo}</span>
          </span>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-background/90 py-2 backdrop-blur-xl md:hidden text-[10px]">
        {modo === "operacao" ? (
          operacaoNav.slice(0, 5).map((n) => (
            <Link key={n.to} to={n.to} search={{ modo: "operacao" }} activeOptions={{ exact: n.to === "/" }} className="flex flex-col items-center gap-0.5 px-2 py-1 text-muted-foreground" activeProps={{ className: "text-primary font-bold" }}>
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))
        ) : (
          [
            { id: "painel", label: "Painel", icon: LayoutDashboard },
            { id: "dre", label: "DRE", icon: BarChart3 },
            { id: "fluxo-caixa", label: "Caixa", icon: TrendingUp },
            { id: "rentabilidade", label: "Margem", icon: PieIcon },
            { id: "alertas-gestao", label: "Alertas", icon: Bell },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectGestaoAba(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 ${aba === item.id ? "text-primary font-bold" : "text-muted-foreground"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))
        )}
      </nav>

      {/* ⌘K Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="O que vamos analisar ou consultar hoje?" />
        <CommandList>
          <CommandEmpty>Nada encontrado. Tente outro termo.</CommandEmpty>
          
          <CommandGroup heading="Módulos da Operação">
            {operacaoNav.map((n) => (
              <CommandItem key={n.to} onSelect={() => { handleSelectOperacaoModo(n.to); setOpen(false); }}>
                <n.icon className="mr-2 h-4 w-4 text-primary" /> {n.label} {modo === "gestao" && <span className="ml-auto text-[10px] text-muted-foreground">(Ir p/ Operação)</span>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Módulos da Gestão Financeira">
            {gestaoNavGroups.flatMap(g => g.items).map((item) => (
              <CommandItem key={item.id} onSelect={() => { handleSelectGestaoAba(item.id); setOpen(false); }}>
                <item.icon className="mr-2 h-4 w-4 text-emerald-400" /> {item.label} {modo === "operacao" && <span className="ml-auto text-[10px] text-muted-foreground">(Ir p/ Gestão)</span>}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Produtos no Ranking">
            {products.map((p) => (
              <CommandItem key={p.id} onSelect={() => { handleSelectOperacaoModo("/"); setOpen(false); }}>
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export function PageTitle({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="rise mb-6">
      <p className="num text-xs uppercase tracking-[0.2em] text-primary">{kicker}</p>
      <h1 className="mt-1 text-3xl font-bold md:text-4xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}
