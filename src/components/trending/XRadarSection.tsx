import { useState, useEffect } from "react";
import { 
  XPostOpportunity, XAccountConfig, initialXConfig, initialXPosts 
} from "@/lib/xMonitorStore";
import { OpportunityItem } from "@/lib/trendingStore";
import { 
  Sparkles, RefreshCw, Filter, Search, ArrowUpRight, DollarSign, 
  ExternalLink, MessageSquare, Heart, Repeat, Eye, ShieldCheck, 
  Zap, Settings, CheckCircle2, TrendingUp, Bot, BrainCircuit, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface XRadarSectionProps {
  onTransformToOpportunity: (item: XPostOpportunity) => void;
}

export function XRadarSection({ onTransformToOpportunity }: XRadarSectionProps) {
  const navigate = useNavigate();

  // Posts State (Persistent localStorage)
  const [posts, setPosts] = useState<XPostOpportunity[]>(() => {
    if (typeof window === "undefined") return initialXPosts;
    const saved = localStorage.getItem("trending_x_posts_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialXPosts;
  });

  // Config State
  const [config, setConfig] = useState<XAccountConfig>(() => {
    if (typeof window === "undefined") return initialXConfig;
    const saved = localStorage.getItem("trending_x_config_v2");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialXConfig;
  });

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trending_x_posts_v2", JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("trending_x_config_v2", JSON.stringify(config));
    }
  }, [config]);

  // Sync feed simulation with fresh market signals
  const handleSyncFeed = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simulate real-time metric updates
      setPosts((prev) =>
        prev.map((p) => {
          if (p.category === "elon_musk") {
            return {
              ...p,
              metrics: {
                ...p.metrics,
                likes: p.metrics.likes + Math.floor(Math.random() * 850 + 120),
                reposts: p.metrics.reposts + Math.floor(Math.random() * 190 + 40),
              },
            };
          }
          return p;
        })
      );
      setConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      setIsSyncing(false);
      toast.success("Feed do X sincronizado em tempo real!", {
        description: "6 novas oportunidades de IA detectadas nas últimas 2h.",
      });
    }, 1200);
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.aiAnalysis.marketNiche.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.aiAnalysis.thesis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendToConselho = (post: XPostOpportunity) => {
    toast.success("Oportunidade enviada ao Conselho Estratégico!", {
      description: "Abrindo o conselho para estruturar o plano de monetização.",
    });
    navigate({
      to: "/conselho",
      search: { modo: "operacao" },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Status da Conexão & Métricas do Monitor X */}
      <div className="glass p-5 rounded-2xl border border-primary/30 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Radar X — Elon Musk & Tendências de IA</h3>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Stream
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitoramento contínuo de publicações do Elon Musk (@elonmusk), líderes de IA e detecção de oportunidades de negócios.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSyncFeed}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition disabled:opacity-50"
              title="Sincronizar feed agora"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar"}</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition glow"
              title="Configurar conta do X"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Conta X: {config.connectedHandle}</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Posts Monitorados</p>
            <p className="text-lg font-bold text-foreground mt-0.5">3.420 <span className="text-[10px] text-emerald-400 font-normal">/ 24h</span></p>
          </div>
          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Oportunidades Filtradas</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">18 detectadas</p>
          </div>
          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Hype Score IA</p>
            <p className="text-lg font-bold text-primary mt-0.5">96.8 / 100 <span className="text-[10px] text-muted-foreground">▲</span></p>
          </div>
          <div className="p-2.5 rounded-xl bg-background/50 border border-border/40">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Sentimento de Negócios</p>
            <p className="text-lg font-bold text-foreground mt-0.5">88% <span className="text-[10px] text-emerald-400 font-semibold">Altamente Lucrativo</span></p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: "all", label: "Todos os Posts" },
            { id: "elon_musk", label: "Elon Musk & xAI" },
            { id: "ai_trends", label: "Tendências de IA" },
            { id: "business_opportunity", label: "Oportunidades de Negócios" },
            { id: "ecommerce_viral", label: "E-commerce Viral" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground font-bold shadow"
                  : "border border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por termo, autor ou nicho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/60 pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Feed Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="glass p-5 rounded-2xl border border-border/60 hover:border-primary/40 transition duration-200 flex flex-col justify-between space-y-4 relative group"
          >
            {/* Post Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-10 w-10 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-foreground">{post.author.name}</h4>
                      {post.author.verified && (
                        <svg className="h-3.5 w-3.5 text-sky-400 fill-current" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                      {post.author.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30">
                          {post.author.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.author.handle} · <span className="text-muted-foreground/80">{post.publishedAt}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={post.relatedUrl || "https://x.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-primary transition rounded-lg hover:bg-white/5"
                  title="Abrir no X (Twitter)"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {/* Tweet Content */}
              <p className="mt-3 text-xs leading-relaxed text-foreground/90 font-medium">
                "{post.content}"
              </p>

              {/* Engagement Metrics */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 hover:text-rose-400 transition cursor-pointer">
                  <Heart className="h-3 w-3 text-rose-400/80" /> {post.metrics.likes.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 hover:text-emerald-400 transition cursor-pointer">
                  <Repeat className="h-3 w-3 text-emerald-400/80" /> {post.metrics.reposts.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {post.metrics.views}
                </span>
                <span className="ml-auto text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {post.metrics.viralVelocity}
                </span>
              </div>
            </div>

            {/* AI Opportunity Analysis Box */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-primary text-[11px]">
                  <Sparkles className="h-3.5 w-3.5" /> Análise de Oportunidade (ToniMaluco IA)
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  Potencial: {post.aiAnalysis.monetizationPotential}
                </span>
              </div>

              <div className="space-y-1 text-muted-foreground text-[11px]">
                <p>
                  <strong className="text-foreground">Tese de Mercado:</strong> {post.aiAnalysis.thesis}
                </p>
                <p>
                  <strong className="text-foreground">Nicho:</strong> {post.aiAnalysis.marketNiche}
                </p>
                <p className="text-emerald-400 font-semibold">
                  <strong>Estimativa de Lucro:</strong> {post.aiAnalysis.estimatedProfitBrl}
                </p>
                <div className="p-2 rounded-lg bg-background/60 border border-border/50 text-[10px] text-foreground mt-1">
                  <strong>Plano de Ação Sugerido:</strong> {post.aiAnalysis.actionPlan}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1.5">
                <button
                  type="button"
                  onClick={() => onTransformToOpportunity(post)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow glow"
                >
                  <Zap className="h-3.5 w-3.5" /> Aproveitar Oportunidade
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToConselho(post)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                  title="Estruturar no Conselho Estratégico"
                >
                  <BrainCircuit className="h-3.5 w-3.5 text-primary" /> Conselho
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="glass p-12 text-center rounded-2xl border border-border/60 space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Nenhum post encontrado para este filtro.</p>
          <p className="text-xs text-muted-foreground/80">Tente buscar por outro termo ou selecione "Todos os Posts".</p>
        </div>
      )}

      {/* Modal: Configuração da Conta X */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-border/60 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-black border border-white/20 flex items-center justify-center text-white">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-sm text-foreground">Conectar Conta do X (Twitter)</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Vincule sua conta para receber alertas personalizados e monitorar menções, listas e tópicos quentes de IA em tempo real.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Handle do X (@usuario)</label>
                <input
                  type="text"
                  value={config.connectedHandle}
                  onChange={(e) => setConfig({ ...config, connectedHandle: e.target.value })}
                  placeholder="@seu_usuario"
                  className="w-full rounded-lg border border-input bg-background/50 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Chave de Conexão / Token Opcional</label>
                <input
                  type="password"
                  value={config.apiKey || ""}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="x_auth_bearer_token..."
                  className="w-full rounded-lg border border-input bg-background/50 p-2.5 outline-none focus:border-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Seu token é salvo localmente no navegador e usado apenas para chamadas autorizadas da API do X.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-accent/30 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Modo Monitor Ativo
                </span>
                <p>Monitorando: Elon Musk (@elonmusk), xAI, Andrej Karpathy, OpenAI e criadores virais de IA.</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfigModal(false);
                  toast.success("Conta do X salva e conectada com sucesso!");
                }}
                className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 glow"
              >
                Salvar Conexão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
