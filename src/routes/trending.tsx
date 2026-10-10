import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { 
  TrendingTopic, OpportunityItem, TrendingEvent, TrendingAlert, MetricSnapshot,
  initialMockTopics, initialEvents, calculateTopicStatus, isTopicOutdated, calculateConfidence
} from "@/lib/trendingStore";
import { products, netMargin, brl } from "@/lib/data";
import { 
  TrendingUp, TrendingDown, Plus, RefreshCw, Upload, Download, Search, Filter, 
  Eye, Bell, Sparkles, CheckCircle2, AlertTriangle, Clock, Target, Calendar as CalendarIcon, 
  Bookmark, Award, ArrowUpRight, ArrowDownRight, Layers, Trash2, Edit3, X, Zap, DollarSign,
  ChevronRight, HelpCircle, Check, Info, FileText
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending Topics — ToniMaluco C.I" },
      { name: "description", content: "O que está mexendo com a demanda agora. Controle manual e inteligência de mercado." },
    ],
  }),
  component: TrendingPage,
});

export function TrendingPage() {
  const navigate = useNavigate();

  // Active Tab State (radar | oportunidades | calendario | seguindo)
  const [activeTab, setActiveTab] = useState<"radar" | "oportunidades" | "calendario" | "seguindo">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("aba");
      if (tabParam === "oportunidades" || tabParam === "calendario" || tabParam === "seguindo") {
        return tabParam;
      }
    }
    return "radar";
  });

  // Sync tab with URL
  const switchTab = (tab: "radar" | "oportunidades" | "calendario" | "seguindo") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("aba", tab);
    window.history.replaceState({}, "", url.toString());
  };

  // Main Topics Data (Persistent localStorage)
  const [topics, setTopics] = useState<TrendingTopic[]>(() => {
    if (typeof window === "undefined") return initialMockTopics;
    const saved = localStorage.getItem("trending_topics_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialMockTopics;
  });

  // Undo History
  const [prevTopics, setPrevTopics] = useState<TrendingTopic[] | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trending_topics_v2", JSON.stringify(topics));
    }
  }, [topics]);

  // Opportunities State
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("trending_opportunities_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trending_opportunities_v2", JSON.stringify(opportunities));
    }
  }, [opportunities]);

  // Events State
  const [events, setEvents] = useState<TrendingEvent[]>(() => {
    if (typeof window === "undefined") return initialEvents;
    const saved = localStorage.getItem("trending_events_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialEvents;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trending_events_v2", JSON.stringify(events));
    }
  }, [events]);

  // Alerts State
  const [alerts, setAlerts] = useState<TrendingAlert[]>([
    { id: "a1", topicId: "top-1", topicName: "GTA VI trailer 3", type: "exploding", message: "Tópico atingiu +310% de alta de buscas!", date: "2026-10-08", read: false },
    { id: "a2", topicId: "top-5", topicName: "Steam Autumn Sale", type: "outdated", message: "Tópico sem atualização há mais de 7 dias.", date: "2026-10-09", read: false }
  ]);

  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // Modals State
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showUpdateNumbersModal, setShowUpdateNumbersModal] = useState(false);
  const [selectedTopicForDetail, setSelectedTopicForDetail] = useState<TrendingTopic | null>(null);
  const [opportunityModalTopic, setOpportunityModalTopic] = useState<TrendingTopic | null>(null);

  // Keyboard Shortcuts (N = Novo Tópico, U = Atualizar Números)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNewTopicModal(true);
      } else if (e.key === "u" || e.key === "U") {
        e.preventDefault();
        setShowUpdateNumbersModal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update topic state helper with undo memory
  const updateTopicsState = (newTopics: TrendingTopic[], msg: string) => {
    setPrevTopics(topics);
    setTopics(newTopics);
    toast.success(msg, {
      action: {
        label: "Desfazer",
        onClick: () => {
          if (prevTopics) {
            setTopics(prevTopics);
            toast.info("Alteração desfeita.");
          }
        }
      }
    });
  };

  // Clear Examples Handler
  const handleClearExamples = () => {
    const customOnly = topics.filter((t) => !t.isExample);
    updateTopicsState(customOnly, "Exemplos removidos. Você está usando dados 100% reais.");
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["ID", "Nome", "Categoria", "Jogo/Plataforma", "UltimoValor", "UltimaAtualizacao", "Observacoes"];
    const rows = topics.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      t.category,
      `"${t.gameOrPlatform.replace(/"/g, '""')}"`,
      t.history.length > 0 ? (t.history[t.history.length - 1]?.value ?? 0) : 0,
      t.updatedAt || "",
      `"${(t.notes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trending_topicos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exportado com sucesso!");
  };

  // Check if using only custom data
  const hasCustomData = topics.some((t) => !t.isExample);
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header & Page Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageTitle kicker="DEMANDA OPERADA PELO USUÁRIO" title="O que está mexendo com a demanda agora.">
          Acompanhamento manual de tendências e oportunidades reais de mercado.
        </PageTitle>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sincronização Indicator */}
          <div className="flex items-center gap-2 rounded-lg bg-accent/50 px-3 py-1.5 text-xs text-muted-foreground border border-border/40">
            <span className="h-2 w-2 rounded-full bg-emerald-400 glow" />
            <span>Dados manuais · atualizado há 1 dia</span>
          </div>

          {/* Alert Bell */}
          <button 
            onClick={() => setShowAlertsModal(true)}
            className="relative rounded-lg border border-border bg-card p-2 text-foreground hover:bg-accent transition"
            title="Central de Alertas"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* CSV Import/Export */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>

          {/* Update Numbers Button */}
          <button 
            onClick={() => setShowUpdateNumbersModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition active:scale-95"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar números <kbd className="hidden sm:inline-block ml-1 px-1 rounded bg-primary/20 text-[9px]">U</kbd>
          </button>

          {/* New Topic Button */}
          <button 
            onClick={() => setShowNewTopicModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition glow active:scale-95"
          >
            <Plus className="h-4 w-4" /> Novo tópico <kbd className="hidden sm:inline-block ml-1 px-1 rounded bg-primary-foreground/20 text-[9px]">N</kbd>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs (Radar | Oportunidades | Calendário | Seguindo) */}
      <div className="flex border-b border-border/40 gap-6 text-sm font-medium">
        <button
          onClick={() => switchTab("radar")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === "radar" ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Zap className="h-4 w-4" /> Radar de Demanda
        </button>
        <button
          onClick={() => switchTab("oportunidades")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === "oportunidades" ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Target className="h-4 w-4" /> Quadro de Oportunidades
          {opportunities.length > 0 && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">{opportunities.length}</span>
          )}
        </button>
        <button
          onClick={() => switchTab("calendario")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === "calendario" ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <CalendarIcon className="h-4 w-4" /> Calendário de Eventos
        </button>
        <button
          onClick={() => switchTab("seguindo")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${activeTab === "seguindo" ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          <Bookmark className="h-4 w-4" /> Tópicos Seguidos
        </button>
      </div>

      {/* Mock Example Warning Banner */}
      {!hasCustomData && (
        <div className="glass p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Exibindo <strong>dados de exemplo</strong> para demonstração. Quando você cadastrar seus tópicos reais, eles substituirão este modelo.</span>
          </div>
          <button 
            onClick={handleClearExamples}
            className="rounded px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition shrink-0"
          >
            Começar do zero
          </button>
        </div>
      )}

      {/* Render Active Sub-Tab Component */}
      {activeTab === "radar" && (
        <RadarTab 
          topics={topics} 
          setTopics={setTopics} 
          onSelectTopic={(t) => setSelectedTopicForDetail(t)}
          onTransformOpportunity={(t) => setOpportunityModalTopic(t)}
        />
      )}

      {activeTab === "oportunidades" && (
        <OportunidadesTab 
          opportunities={opportunities} 
          setOpportunities={setOpportunities} 
        />
      )}

      {activeTab === "calendario" && (
        <CalendarioTab 
          events={events} 
          setEvents={setEvents} 
          topics={topics}
        />
      )}

      {activeTab === "seguindo" && (
        <SeguindoTab 
          topics={topics} 
          setTopics={setTopics}
          onSelectTopic={(t) => setSelectedTopicForDetail(t)}
        />
      )}

      {/* Modals & Slide-over Drawers */}

      {/* 1. Modal Novo Tópico */}
      {showNewTopicModal && (
        <NewTopicModal 
          onClose={() => setShowNewTopicModal(false)}
          onSave={(newTopic) => {
            updateTopicsState([newTopic, ...topics], `Tópico "${newTopic.name}" cadastrado!`);
            setShowNewTopicModal(false);
          }}
        />
      )}

      {/* 2. Modal Atualizar Números */}
      {showUpdateNumbersModal && (
        <UpdateNumbersModal 
          topics={topics}
          onClose={() => setShowUpdateNumbersModal(false)}
          onSave={(updatedTopics) => {
            updateTopicsState(updatedTopics, "Histórico de números atualizado com sucesso!");
            setShowUpdateNumbersModal(false);
          }}
        />
      )}

      {/* 3. Drawer de Detalhes do Tópico */}
      {selectedTopicForDetail && (
        <TopicDetailDrawer 
          topic={selectedTopicForDetail}
          onClose={() => setSelectedTopicForDetail(null)}
          onUpdateTopic={(updated) => {
            const next = topics.map(t => t.id === updated.id ? updated : t);
            setTopics(next);
            setSelectedTopicForDetail(updated);
          }}
          onTransformOpportunity={(t) => {
            setSelectedTopicForDetail(null);
            setOpportunityModalTopic(t);
          }}
        />
      )}

      {/* 4. Modal Transformar em Oportunidade */}
      {opportunityModalTopic && (
        <CreateOpportunityModal 
          topic={opportunityModalTopic}
          onClose={() => setOpportunityModalTopic(null)}
          onCreate={(newOpp) => {
            setOpportunities([newOpp, ...opportunities]);
            setOpportunityModalTopic(null);
            toast.success(`Oportunidade "${newOpp.topicName}" criada e enviada à Central!`);
          }}
        />
      )}

      {/* 5. Modal Central de Alertas */}
      {showAlertsModal && (
        <AlertsModal 
          alerts={alerts}
          onClose={() => setShowAlertsModal(false)}
          onMarkAllAsRead={() => setAlerts(alerts.map(a => ({ ...a, read: true })))}
        />
      )}

      {/* Legal Footer Disclaimer */}
      <footer className="pt-8 border-t border-border/40 text-center text-xs text-muted-foreground">
        "Análises são estimativas para apoio à decisão, não garantia de resultado nem aconselhamento financeiro."
      </footer>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-TAB 1: RADAR DE DEMANDA
// ----------------------------------------------------------------------
function RadarTab({ 
  topics, setTopics, onSelectTopic, onTransformOpportunity 
}: { 
  topics: TrendingTopic[]; 
  setTopics: (t: TrendingTopic[]) => void;
  onSelectTopic: (t: TrendingTopic) => void;
  onTransformOpportunity: (t: TrendingTopic) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [onlyMyProducts, setOnlyMyProducts] = useState(false);
  const [sortBy, setSortBy] = useState<"crescimento" | "interesse" | "atualizacao">("crescimento");
  const [viewMode, setViewMode] = useState<"cards" | "lista" | "heatmap">("cards");

  // Top Summary Cards
  const summary = useMemo(() => {
    let explodindo = 0;
    let subindo = 0;
    let caida = 0;
    let desatualizados = 0;
    let meusProdutos = 0;
    let maiorAltaName = "-";
    let maiorAltaVal = -999;

    topics.forEach((t) => {
      const { status, deltaPct } = calculateTopicStatus(t.history);
      if (status === "Explodindo") explodindo++;
      if (status === "Subindo") subindo++;
      if (status === "Caindo") caida++;
      if (isTopicOutdated(t.updatedAt)) desatualizados++;
      if (t.relatedProducts && t.relatedProducts.length > 0) meusProdutos++;

      if (deltaPct > maiorAltaVal) {
        maiorAltaVal = deltaPct;
        maiorAltaName = t.name;
      }
    });

    return {
      emAlta: explodindo + subindo,
      maiorAltaText: maiorAltaVal > -999 ? `${maiorAltaName} (+${maiorAltaVal}%)` : "-",
      caida,
      desatualizados,
      meusProdutos
    };
  }, [topics]);

  // Filtered & Sorted Topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.gameOrPlatform.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === "todos" || t.category === categoryFilter;
      const matchesMyProducts = !onlyMyProducts || (t.relatedProducts && t.relatedProducts.length > 0);
      return matchesSearch && matchesCat && matchesMyProducts;
    }).sort((a, b) => {
      const statA = calculateTopicStatus(a.history);
      const statB = calculateTopicStatus(b.history);

      if (sortBy === "crescimento") return statB.deltaPct - statA.deltaPct;
      if (sortBy === "interesse") {
        const valA = a.history.length > 0 ? (a.history[a.history.length - 1]?.value ?? 0) : 0;
        const valB = b.history.length > 0 ? (b.history[b.history.length - 1]?.value ?? 0) : 0;
        return valB - valA;
      }
      if (sortBy === "atualizacao") {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      return 0;
    });
  }, [topics, searchTerm, categoryFilter, onlyMyProducts, sortBy]);

  // Toggle Follow
  const toggleFollow = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = topics.map(t => t.id === topicId ? { ...t, isFollowing: !t.isFollowing } : t);
    setTopics(next);
    toast.info("Status de seguimento atualizado.");
  };

  return (
    <div className="space-y-6">
      {/* 3a) Resumo Executivo no Topo */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="glass p-3.5 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tópicos em Alta</span>
          <p className="num text-2xl font-bold text-emerald-400">{summary.emAlta}</p>
        </div>
        <div className="glass p-3.5 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Maior Alta em 7d</span>
          <p className="num text-sm font-bold text-primary truncate">{summary.maiorAltaText}</p>
        </div>
        <div className="glass p-3.5 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Em Queda</span>
          <p className="num text-2xl font-bold text-rose-400">{summary.caida}</p>
        </div>
        <div className="glass p-3.5 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tocam meus produtos</span>
          <p className="num text-2xl font-bold text-amber-400">{summary.meusProdutos}</p>
        </div>
        <div className="glass p-3.5 space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Desatualizados (&gt;7d)</span>
          <p className="num text-2xl font-bold text-muted-foreground">{summary.desatualizados}</p>
        </div>
      </div>

      {/* 3b) Controles de Filtros e Visões */}
      <div className="glass p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar tópico ou jogo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background/50 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>

        {/* Category Selector */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-background/50 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
        >
          <option value="todos">Todas Categorias</option>
          <option value="FPS">FPS</option>
          <option value="Battle Royale">Battle Royale</option>
          <option value="Esportes">Esportes</option>
          <option value="Sandbox">Sandbox</option>
          <option value="MOBA">MOBA</option>
          <option value="Outros">Outros</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-lg border border-border bg-background/50 px-2.5 py-1.5 text-xs outline-none focus:border-primary"
        >
          <option value="crescimento">Mais Crescimento %</option>
          <option value="interesse">Maior Interesse (0-100)</option>
          <option value="atualizacao">Última Atualização</option>
        </select>

        {/* Filter My Products */}
        <button
          onClick={() => setOnlyMyProducts(!onlyMyProducts)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition border ${onlyMyProducts ? "bg-primary/20 border-primary text-primary font-semibold" : "border-border text-muted-foreground hover:bg-accent"}`}
        >
          <Target className="h-3.5 w-3.5" /> Só meus produtos
        </button>

        {/* View Switcher (Cards | Lista | Mapa de calor) */}
        <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border">
          <button
            onClick={() => setViewMode("cards")}
            className={`px-2 py-1 text-xs rounded transition ${viewMode === "cards" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode("lista")}
            className={`px-2 py-1 text-xs rounded transition ${viewMode === "lista" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
          >
            Lista
          </button>
          <button
            onClick={() => setViewMode("heatmap")}
            className={`px-2 py-1 text-xs rounded transition ${viewMode === "heatmap" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
          >
            Mapa de calor
          </button>
        </div>
      </div>

      {/* 3c) Visão em Cards */}
      {viewMode === "cards" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const { status, deltaPct } = calculateTopicStatus(topic.history);
            const outdated = isTopicOutdated(topic.updatedAt);
            const confidence = calculateConfidence(topic.history, topic.updatedAt);

            return (
              <div 
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="glass p-4 rounded-xl space-y-3 cursor-pointer hover:border-primary/50 transition hover:glow group relative"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {topic.category}
                      </span>
                      {outdated && (
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Desatualizado
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-base mt-1 group-hover:text-primary transition">{topic.name}</h4>
                    <p className="text-xs text-muted-foreground">{topic.gameOrPlatform}</p>
                  </div>

                  {/* Bookmark Toggle */}
                  <button 
                    onClick={(e) => toggleFollow(topic.id, e)}
                    className={`p-1.5 rounded-lg border transition ${topic.isFollowing ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>

                {/* Growth % & Sparkline */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div>
                    <p className={`num text-2xl font-extrabold ${deltaPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {deltaPct >= 0 ? "+" : ""}{deltaPct}%
                    </p>
                    <span className="text-[10px] text-muted-foreground">crescimento histórico</span>
                  </div>

                  {/* Sparkline */}
                  <div className="w-24 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={topic.history}>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={deltaPct >= 0 ? "var(--invest)" : "var(--avoid)"} 
                          fill={deltaPct >= 0 ? "var(--invest)" : "var(--avoid)"} 
                          fillOpacity={0.2} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/30">
                  <span className="flex items-center gap-1">
                    {topic.isExample ? (
                      <span className="text-amber-400 font-medium">estimativa</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">registrado por você</span>
                    )}
                  </span>
                  <span>Confiança: <strong className="text-foreground">{confidence}%</strong></span>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTransformOpportunity(topic);
                  }}
                  className="w-full rounded-lg border border-primary/40 bg-primary/10 py-1.5 text-xs text-primary font-semibold transition hover:bg-primary/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Target className="h-3.5 w-3.5" /> Transformar em oportunidade
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3c) Visão em Lista */}
      {viewMode === "lista" && (
        <div className="glass p-4 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                <th className="py-2">Tópico</th>
                <th className="py-2">Categoria</th>
                <th className="py-2">Jogo/Plataforma</th>
                <th className="py-2 text-right">Crescimento</th>
                <th className="py-2 text-center">Status</th>
                <th className="py-2 text-right">Confiança</th>
                <th className="py-2 text-right">Última Atualização</th>
                <th className="py-2 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic) => {
                const { status, deltaPct } = calculateTopicStatus(topic.history);
                const confidence = calculateConfidence(topic.history, topic.updatedAt);
                return (
                  <tr 
                    key={topic.id}
                    onClick={() => onSelectTopic(topic)}
                    className="border-b border-border/20 hover:bg-accent/40 cursor-pointer transition"
                  >
                    <td className="py-2.5 font-bold text-foreground">{topic.name}</td>
                    <td className="py-2.5"><span className="bg-accent px-2 py-0.5 rounded text-[10px]">{topic.category}</span></td>
                    <td className="py-2.5 text-muted-foreground">{topic.gameOrPlatform}</td>
                    <td className={`py-2.5 text-right num font-bold ${deltaPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {deltaPct >= 0 ? "+" : ""}{deltaPct}%
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${status === "Explodindo" ? "bg-amber-500/20 text-amber-400" : status === "Subindo" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium">{confidence}%</td>
                    <td className="py-2.5 text-right text-muted-foreground">{topic.updatedAt}</td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransformOpportunity(topic);
                        }}
                        className="rounded bg-primary/10 border border-primary/30 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
                      >
                        Oportunidade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3e) Visão Mapa de Calor (Heatmap) */}
      {viewMode === "heatmap" && (
        <div className="glass p-5 rounded-xl space-y-4">
          <h4 className="font-bold text-sm">Mapa de Calor por Categoria</h4>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {["FPS", "Battle Royale", "Esportes", "Sandbox", "MOBA", "Outros"].map((cat) => {
              const catTopics = filteredTopics.filter(t => t.category === cat);
              const totalDelta = catTopics.reduce((acc, curr) => acc + calculateTopicStatus(curr.history).deltaPct, 0);
              const avgDelta = catTopics.length > 0 ? Math.round(totalDelta / catTopics.length) : 0;

              return (
                <div 
                  key={cat}
                  className={`p-4 rounded-xl border space-y-2 transition ${avgDelta > 50 ? "bg-emerald-950/40 border-emerald-500/40 glow" : avgDelta > 0 ? "bg-primary/10 border-primary/30" : "bg-card border-border"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">{cat}</span>
                    <span className={`num font-bold text-xs ${avgDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      Média {avgDelta >= 0 ? "+" : ""}{avgDelta}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{catTopics.length} tópico(s) nesta categoria</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-TAB 2: QUADRO DE OPORTUNIDADES (KANBAN)
// ----------------------------------------------------------------------
function OportunidadesTab({ 
  opportunities, setOpportunities 
}: { 
  opportunities: OpportunityItem[];
  setOpportunities: (o: OpportunityItem[]) => void;
}) {
  const moveColumn = (oppId: string, targetCol: OpportunityItem["column"]) => {
    const next = opportunities.map(o => o.id === oppId ? { ...o, column: targetCol } : o);
    setOpportunities(next);
    toast.info("Oportunidade movida para " + targetCol);
  };

  const columns: OpportunityItem["column"][] = ["Nova", "Testando", "Vendendo", "Descartada"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map((col) => {
          const items = opportunities.filter(o => o.column === col);
          return (
            <div key={col} className="glass p-3 rounded-xl space-y-3 min-h-[400px]">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">{col}</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-foreground">{items.length}</span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="glass p-3 rounded-lg space-y-2 border border-border/50 hover:border-primary/40 transition">
                    <h5 className="font-bold text-xs text-foreground">{item.topicName}</h5>

                    {/* Products Suggested */}
                    <div className="space-y-1">
                      {item.suggestedProducts.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-muted-foreground">
                          <span>{p.name}</span>
                          <span className="text-emerald-400 font-bold">{p.netMarginPct}% margem</span>
                        </div>
                      ))}
                    </div>

                    {/* Move controls */}
                    <div className="flex justify-between items-center pt-2 border-t border-border/30 text-[10px]">
                      {col !== "Nova" && (
                        <button 
                          onClick={() => {
                            const prevCol = columns[columns.indexOf(col) - 1];
                            if (prevCol) moveColumn(item.id, prevCol);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          &larr; Voltar
                        </button>
                      )}
                      {col !== "Descartada" && (
                        <button 
                          onClick={() => {
                            const nextCol = columns[columns.indexOf(col) + 1];
                            if (nextCol) moveColumn(item.id, nextCol);
                          }}
                          className="text-primary font-bold hover:underline ml-auto"
                        >
                          Avançar &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border/40 rounded-lg">
                    Nenhuma oportunidade aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-TAB 3: CALENDÁRIO DE EVENTOS
// ----------------------------------------------------------------------
function CalendarioTab({ 
  events, setEvents, topics 
}: { 
  events: TrendingEvent[];
  setEvents: (e: TrendingEvent[]) => void;
  topics: TrendingTopic[];
}) {
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventCat, setNewEventCat] = useState<TrendingEvent["category"]>("Lancamento");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    const item: TrendingEvent = {
      id: "ev-" + Date.now(),
      title: newEventTitle,
      startDate: newEventDate,
      endDate: newEventDate,
      category: newEventCat,
      affectsMyProducts: true
    };
    setEvents([...events, item]);
    setNewEventTitle("");
    setNewEventDate("");
    toast.success("Evento cadastrado no Calendário!");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddEvent} className="glass p-4 rounded-xl flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-muted-foreground mb-1">Título do Evento</label>
          <input 
            type="text" 
            placeholder="Ex: Lançamento Passe de Batalha Ep.10" 
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Data</label>
          <input 
            type="date" 
            value={newEventDate}
            onChange={(e) => setNewEventDate(e.target.value)}
            className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Categoria</label>
          <select 
            value={newEventCat}
            onChange={(e) => setNewEventCat(e.target.value as any)}
            className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs outline-none focus:border-primary"
          >
            <option value="Lancamento">Lançamento</option>
            <option value="Patch">Patch</option>
            <option value="Torneio">Torneio</option>
            <option value="Promocao">Promoção</option>
            <option value="Temporada">Temporada</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110">
          + Evento
        </button>
      </form>

      {/* Events List */}
      <div className="glass p-4 rounded-xl space-y-3">
        <h4 className="font-bold text-sm">Próximos Eventos Estratégicos do Mercado</h4>
        <div className="space-y-2">
          {events.map((ev) => (
            <div key={ev.id} className="p-3 rounded-lg border border-border/40 bg-accent/30 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" /> {ev.title}
                </span>
                <p className="text-muted-foreground">{ev.startDate} · {ev.category} {ev.topicName ? `(${ev.topicName})` : ""}</p>
              </div>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                Afeta meus produtos
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-TAB 4: TÓPICOS SEGUIDOS
// ----------------------------------------------------------------------
function SeguindoTab({ 
  topics, setTopics, onSelectTopic 
}: { 
  topics: TrendingTopic[];
  setTopics: (t: TrendingTopic[]) => void;
  onSelectTopic: (t: TrendingTopic) => void;
}) {
  const followed = topics.filter(t => t.isFollowing);

  return (
    <div className="space-y-6">
      <div className="glass p-4 rounded-xl space-y-4">
        <h4 className="font-bold text-sm">Tópicos que Você Está Monitorando ({followed.length})</h4>
        {followed.length === 0 ? (
          <p className="text-xs text-muted-foreground">Você ainda não está seguindo nenhum tópico. Clique no ícone de marcador nos cards do Radar para seguir.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {followed.map((topic) => {
              const { status, deltaPct } = calculateTopicStatus(topic.history);
              return (
                <div key={topic.id} onClick={() => onSelectTopic(topic)} className="p-3 rounded-lg border border-border bg-card cursor-pointer hover:border-primary transition space-y-1">
                  <h5 className="font-bold text-xs">{topic.name}</h5>
                  <p className="text-[10px] text-muted-foreground">{topic.gameOrPlatform}</p>
                  <p className={`num text-lg font-bold ${deltaPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {deltaPct >= 0 ? "+" : ""}{deltaPct}%
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MODALS & DRAWERS IMPLEMENTATION
// ----------------------------------------------------------------------

// 1. Modal Novo Tópico
function NewTopicModal({ onClose, onSave }: { onClose: () => void; onSave: (t: TrendingTopic) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<TrendingTopic["category"]>("FPS");
  const [gameOrPlatform, setGameOrPlatform] = useState("");
  const [notes, setNotes] = useState("");
  const [initialValue, setInitialValue] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const todayStr = new Date().toISOString().split("T")[0] || "2026-10-10";
    const newTopic: TrendingTopic = {
      id: "top-" + Date.now(),
      name,
      category,
      gameOrPlatform,
      notes,
      relatedProducts: [],
      isFollowing: true,
      history: [
        { id: "m-" + Date.now(), date: todayStr, value: Number(initialValue), registeredBy: "Você" }
      ],
      updatedAt: todayStr,
      isExample: false
    };

    onSave(newTopic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass p-6 rounded-xl w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Cadastrar Novo Tópico
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1">Nome do Tópico *</label>
            <input 
              type="text" 
              placeholder="Ex: Valorant Passe Episódio 10" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted-foreground mb-1">Categoria</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value as any)} 
                className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
              >
                <option value="FPS">FPS</option>
                <option value="Battle Royale">Battle Royale</option>
                <option value="Esportes">Esportes</option>
                <option value="Sandbox">Sandbox</option>
                <option value="MOBA">MOBA</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1">Jogo/Plataforma</label>
              <input 
                type="text" 
                placeholder="Ex: Valorant / Riot" 
                value={gameOrPlatform} 
                onChange={(e) => setGameOrPlatform(e.target.value)} 
                className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Interesse Inicial (0 a 100)</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={initialValue} 
              onChange={(e) => setInitialValue(Number(e.target.value))} 
              className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Observações</label>
            <textarea 
              placeholder="Motivo do interesse ou contexto..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary h-20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-accent">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary font-semibold text-primary-foreground hover:brightness-110">Salvar Tópico</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. Modal Atualizar Números (Tabela Rápida)
function UpdateNumbersModal({ topics, onClose, onSave }: { topics: TrendingTopic[]; onClose: () => void; onSave: (t: TrendingTopic[]) => void }) {
  const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || "");
  const [val, setVal] = useState(75);
  const [competitors, setCompetitors] = useState(20);
  const [avgPrice, setAvgPrice] = useState(50);
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().split("T")[0] || "2026-10-10");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId) return;

    const next: TrendingTopic[] = topics.map((t) => {
      if (t.id === selectedTopicId) {
        const newSnap: MetricSnapshot = {
          id: "m-" + Date.now(),
          date: dateStr || "2026-10-10",
          value: Number(val),
          competitorsCount: Number(competitors),
          avgPrice: Number(avgPrice),
          registeredBy: "Você"
        };
        return {
          ...t,
          history: [...t.history, newSnap],
          updatedAt: dateStr || "2026-10-10",
          isExample: false
        };
      }
      return t;
    });

    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass p-6 rounded-xl w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" /> Atualizar Números de Tópico
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-muted-foreground mb-1">Selecionar Tópico</label>
            <select 
              value={selectedTopicId} 
              onChange={(e) => setSelectedTopicId(e.target.value)} 
              className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
            >
              {topics.map(t => <option key={t.id} value={t.id}>{t.name} ({t.gameOrPlatform})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted-foreground mb-1">Data do Lançamento</label>
              <input 
                type="date" 
                value={dateStr} 
                onChange={(e) => setDateStr(e.target.value)} 
                className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Valor de Interesse (0 a 100)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={val} 
                onChange={(e) => setVal(Number(e.target.value))} 
                className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-muted-foreground mb-1">Anúncios Concorrentes</label>
              <input 
                type="number" 
                value={competitors} 
                onChange={(e) => setCompetitors(Number(e.target.value))} 
                className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Preço Médio Praticado (R$)</label>
              <input 
                type="number" 
                value={avgPrice} 
                onChange={(e) => setAvgPrice(Number(e.target.value))} 
                className="w-full rounded-lg border border-border bg-background/50 p-2 outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-accent">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary font-semibold text-primary-foreground hover:brightness-110">Registrar Ponto</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. Drawer de Detalhes do Tópico (Slide-Over)
function TopicDetailDrawer({ 
  topic, onClose, onUpdateTopic, onTransformOpportunity 
}: { 
  topic: TrendingTopic; 
  onClose: () => void; 
  onUpdateTopic: (t: TrendingTopic) => void;
  onTransformOpportunity: (t: TrendingTopic) => void;
}) {
  const { status, deltaPct } = calculateTopicStatus(topic.history);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm">
      <div className="glass h-full w-full max-w-xl p-6 overflow-y-auto space-y-6 border-l border-border animate-in slide-in-from-right duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-border/40">
          <div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{topic.category}</span>
            <h3 className="font-bold text-xl mt-1">{topic.name}</h3>
            <p className="text-xs text-muted-foreground">{topic.gameOrPlatform}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg border border-border hover:bg-accent"><X className="h-5 w-5" /></button>
        </div>

        {/* INSIGHT POR QUE INVESTIR */}
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 space-y-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> INSIGHT · POR QUE INVESTIR?
          </span>
          <p className="text-xs leading-relaxed text-foreground">
            {deltaPct > 50 ? (
              `Este tópico apresenta uma forte aceleração de demanda (+${deltaPct}%). Os dados lançados indicam oportunidade clara de entrada rápida com margem saudável.`
            ) : (
              `Demanda em nível estável/moderado. Ideal para manter estoque enxuto e testar lotes pequenos.`
            )}
          </p>
        </div>

        {/* Evolution Chart */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs">Histórico de Evolução de Interesse</h4>
          <div className="h-44 glass p-2 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={topic.history}>
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Registered Snapshots History Table */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs">Pontos Registrados no Histórico</h4>
          <div className="glass p-3 rounded-lg max-h-40 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground uppercase text-[9px]">
                  <th className="py-1">Data</th>
                  <th className="py-1 text-right">Interesse</th>
                  <th className="py-1 text-right">Concorrentes</th>
                  <th className="py-1 text-right">Registrado Por</th>
                </tr>
              </thead>
              <tbody>
                {topic.history.map((h) => (
                  <tr key={h.id} className="border-b border-border/20">
                    <td className="py-1.5">{h.date}</td>
                    <td className="py-1.5 text-right font-bold text-primary">{h.value}</td>
                    <td className="py-1.5 text-right text-muted-foreground">{h.competitorsCount || "-"}</td>
                    <td className="py-1.5 text-right text-muted-foreground">{h.registeredBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onTransformOpportunity(topic)}
          className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 glow flex items-center justify-center gap-2"
        >
          <Target className="h-4 w-4" /> Transformar em Oportunidade
        </button>
      </div>
    </div>
  );
}

// 4. Modal Transformar em Oportunidade
function CreateOpportunityModal({ topic, onClose, onCreate }: { topic: TrendingTopic; onClose: () => void; onCreate: (opp: OpportunityItem) => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item: OpportunityItem = {
      id: "opp-" + Date.now(),
      topicId: topic.id,
      topicName: topic.name,
      column: "Nova",
      suggestedProducts: topic.relatedProducts.map(p => {
        const m = netMargin(p.price, p.cost, p.platform);
        return {
          name: p.name,
          platform: p.platform,
          cost: p.cost,
          price: p.price,
          netMarginPct: Math.round(m.pct),
          risk: "Baixo",
          liquidity: 80
        };
      }),
      createdAt: new Date().toISOString().split("T")[0] || "2026-10-10"
    };
    onCreate(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass p-6 rounded-xl w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Confirmar Oportunidade
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <p className="text-xs text-muted-foreground">
          Transformar <strong>"{topic.name}"</strong> em uma oportunidade ativa para o Quadro Kanban e para o Ranking de Oportunidades da Central.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-accent/50 border border-border space-y-1">
            <span className="font-bold text-foreground">Produtos sugeridos vinculados:</span>
            {topic.relatedProducts.length > 0 ? (
              topic.relatedProducts.map(p => (
                <div key={p.id} className="flex justify-between text-muted-foreground">
                  <span>{p.name}</span>
                  <span className="text-primary font-bold">{brl(p.price)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">Nenhum produto cadastrado diretamente neste tópico.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-accent">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary font-bold text-primary-foreground hover:brightness-110">Criar Oportunidade</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. Modal Central de Alertas
function AlertsModal({ alerts, onClose, onMarkAllAsRead }: { alerts: TrendingAlert[]; onClose: () => void; onMarkAllAsRead: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="glass p-6 rounded-xl w-full max-w-md space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Central de Alertas de Mercado
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {alerts.map((a) => (
            <div key={a.id} className="p-3 rounded-lg border border-border bg-card flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> {a.topicName}
                </span>
                <p className="text-muted-foreground">{a.message}</p>
                <span className="text-[10px] text-muted-foreground">{a.date}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border/40">
          <button onClick={onMarkAllAsRead} className="text-xs text-primary hover:underline font-semibold">Marcar todos como lidos</button>
          <button onClick={onClose} className="px-4 py-1.5 text-xs rounded-lg bg-accent hover:bg-accent/80">Fechar</button>
        </div>
      </div>
    </div>
  );
}
