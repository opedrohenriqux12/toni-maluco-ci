import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Eye, 
  Tag, 
  PackageCheck, 
  ShieldAlert, 
  Headphones, 
  Flame, 
  Star, 
  AlertTriangle, 
  DollarSign, 
  BarChart3,
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RotateCcw
} from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { brl } from "@/lib/data";

export const Route = createFileRoute("/inteligencia")({
  head: () => ({
    meta: [
      { title: "Central de Inteligência da Loja — ToniMaluco C.I" },
      { name: "description", content: "Monitoramento de concorrência, estoque, precificação, reputação e finanças em tempo real com edição completa." },
    ],
  }),
  component: InteligenciaPage,
});

type TabType = 
  | "concorrencia" 
  | "desempenho" 
  | "precificacao" 
  | "estoque" 
  | "posvenda" 
  | "atendimento" 
  | "tendencias" 
  | "reputacao" 
  | "conformidade" 
  | "financeiro";

interface CompetitorItem { id: string; name: string; platform: string; product: string; price: number; lastChange: string; sales: number; stock: string; rating: string; alert: string }
interface DesempenhoItem { id: string; title: string; views: number; clicks: number; conv: string; avgTicket: number; margin: string; status: string }
interface PrecificacaoItem { id: string; strategy: string; price: number; marginPct: string; description: string; isIdeal?: boolean }
interface EstoqueItem { id: string; name: string; item: string; cost: string; defectRate: string; risk: string; alert: string }
interface PosVendaItem { id: string; label: string; value: string; target: string; status: string }
interface AtendimentoItem { id: string; question: string; freq: string; action: string }
interface TendenciaItem { id: string; title: string; description: string; badge: string }
interface ReputacaoItem { id: string; title: string; score: string; detail: string; highlights: string }
interface ConformidadeItem { id: string; platform: string; rule: string; warning: string; riskLevel: "alto" | "medio" | "baixo" }
interface FinanceiroItem { id: string; label: string; value: string; note?: string }

interface InteligenciaData {
  concorrencia: CompetitorItem[];
  desempenho: DesempenhoItem[];
  precificacao: PrecificacaoItem[];
  estoque: EstoqueItem[];
  posvenda: PosVendaItem[];
  atendimento: AtendimentoItem[];
  tendencias: TendenciaItem[];
  reputacao: ReputacaoItem[];
  conformidade: ConformidadeItem[];
  financeiro: FinanceiroItem[];
}

const defaultData: InteligenciaData = {
  concorrencia: [
    { id: "c1", name: "MegaStore Digital", platform: "GGMAX", product: "Valorant Points 1000", price: 39.90, lastChange: "-R$2.10 (há 2h)", sales: 1420, stock: "~45 un", rating: "4.9 ★", alert: "Baixou preço para liderar a busca" },
    { id: "c2", name: "Nexus Keys", platform: "Eneba", product: "FC 26 Points 2800", price: 114.50, lastChange: "Nova variação adicionada", sales: 890, stock: "~12 un", rating: "4.7 ★", alert: "Lançou lote 'Versão Global'" },
    { id: "c3", name: "Vip Account BR", platform: "GGMAX", product: "Conta LoL Smurf Nv.30", price: 29.90, lastChange: "-R$5.00 (ontem)", sales: 3100, stock: "~200 un", rating: "4.2 ★", alert: "Alta taxa de reclamação recente" },
  ],
  desempenho: [
    { id: "d1", title: "Valorant Points 1000 — Entrega Automática", views: 4210, clicks: 680, conv: "16.1%", avgTicket: 42.00, margin: "26.1%", status: "Campeão de Vendas" },
    { id: "d2", title: "FC 26 Points 2800 — TOTY Ready", views: 2890, clicks: 310, conv: "10.7%", avgTicket: 119.00, margin: "29.4%", status: "Alta Margem" },
    { id: "d3", title: "Gift Card Steam R$50", views: 8900, clicks: 420, conv: "4.7%", avgTicket: 54.00, margin: "3.2%", status: "Só ocupa espaço (Baixa Margem)" },
  ],
  precificacao: [
    { id: "p1", strategy: "Preço Agressivo (Líder da Busca)", price: 38.90, marginPct: "14.5%", description: "Margem Líquida: 14.5% (Giro Rápido)", isIdeal: false },
    { id: "p2", strategy: "Preço Ideal Sugerido ⭐", price: 42.00, marginPct: "26.1%", description: "Margem Líquida: 26.1% (Equilibrado)", isIdeal: true },
    { id: "p3", strategy: "Preço Maximizador de Margem", price: 44.90, marginPct: "32.8%", description: "Margem Líquida: 32.8% (Menos Giro)", isIdeal: false },
  ],
  estoque: [
    { id: "e1", name: "GlobalKeys Direct", item: "VP 1000 Gift Cards", cost: "R$ 31.00", defectRate: "0.4%", risk: "Baixo", alert: "Estoque ok (420 un)" },
    { id: "e2", name: "SkinsExpress EU", item: "CS2 Skins Stock", cost: "R$ 150.00", defectRate: "3.2%", risk: "Médio (Lock 7 dias)", alert: "Reposição necessária em 2 dias" },
    { id: "e3", name: "DigitalAccounts Asia", item: "Contas LoL Smurf", cost: "R$ 12.00", defectRate: "14.8%", risk: "Alto (Banimento em Onda)", alert: "🔴 Taxa de defeito alta!" },
  ],
  posvenda: [
    { id: "pv1", label: "Taxa de Reclamação", value: "1.2%", target: "Meta: < 2.5%", status: "Excelente" },
    { id: "pv2", label: "Taxa de Disputa / Mediada", value: "0.4%", target: "Excelente reputação", status: "Excelente" },
    { id: "pv3", label: "Taxa de Reposição por Lote", value: "2.1%", target: "Concentrado em Contas", status: "Alerta" },
    { id: "pv4", label: "Tempo Médio de Resolução", value: "14 min", target: "Atendimento Ágil", status: "Ótimo" },
  ],
  atendimento: [
    { id: "a1", question: "Como resgatar meu código?", freq: "42% dos chamados", action: "Adicionado ao FAQ do anúncio" },
    { id: "a2", question: "Qual o prazo de envio?", freq: "28% dos chamados", action: "Adicionado ao título automático" },
    { id: "a3", question: "É seguro/Tem ban?", freq: "18% dos chamados", action: "Covered pela Garantia Legal" },
  ],
  tendencias: [
    { id: "t1", title: "🔥 VALORANT Episódio 10 (+184%)", description: "Lançamento de coleção de passe puxa busca por VP 1000 e 2050.", badge: "Alta Demanda" },
    { id: "t2", title: "⚽ FC 26 Team of the Year (+142%)", description: "Sazonalidade de janeiro com alta na compra de FC Points 2800.", badge: "Sazonal" },
    { id: "t3", title: "🎮 GTA VI Trailer 3 (+310%)", description: "Pré-vendas e Gift Cards da PSN/Xbox subindo forte.", badge: "Tendência" },
  ],
  reputacao: [
    { id: "r1", title: "Selo Vendedor Ouro", score: "4.92 / 5.0 ★", detail: "Baseado em 1.480 avaliações nos últimos 90 dias", highlights: '"Entrega rápida no chat" (84%), "Código funcionou de primeira" (12%).' },
  ],
  conformidade: [
    { id: "conf1", platform: "GGMAX", rule: "Proibição de Contatos Externos", warning: "Lembrete: Trocar Discord, WhatsApp ou redes no chat resulta em suspensão imediata da conta.", riskLevel: "alto" },
    { id: "conf2", platform: "Meta / Instagram", rule: "Contas de Redes Sociais", warning: "Venda direta fere os termos da Meta. Nunca use termos como '100% sem bloqueio'.", riskLevel: "alto" },
  ],
  financeiro: [
    { id: "f1", label: "Faturamento Bruto (Mês)", value: "R$ 24.850", note: "Total acumulado" },
    { id: "f2", label: "Taxas das Plataformas", value: "-R$ 3.120", note: "Médias de 12.5%" },
    { id: "f3", label: "Custo de Produtos (CMV)", value: "-R$ 15.400", note: "Aquisição de lote" },
    { id: "f4", label: "Lucro Líquido no Bolso", value: "R$ 6.330", note: "Margem de 25.4%" },
  ],
};

const STORAGE_KEY = "inteligencia_store_v3";

function InteligenciaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("concorrencia");
  const [data, setData] = useState<InteligenciaData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return defaultData;
  });

  const [modalState, setModalState] = useState<{ tab: TabType; item: any | null } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  const resetToDefault = () => {
    if (confirm("Deseja restaurar os dados originais da Central de Inteligência?")) {
      setData(defaultData);
      toast.success("Dados restaurados para os padrões!");
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: "concorrencia", label: "Concorrência", icon: Eye },
    { id: "desempenho", label: "Desempenho", icon: BarChart3 },
    { id: "precificacao", label: "Precificação", icon: Tag },
    { id: "estoque", label: "Estoque & Fornecedores", icon: PackageCheck },
    { id: "posvenda", label: "Pós-Venda & Qualidade", icon: ShieldAlert },
    { id: "atendimento", label: "Atendimento & FAQ", icon: Headphones },
    { id: "tendencias", label: "Tendências", icon: Flame },
    { id: "reputacao", label: "Reputação", icon: Star },
    { id: "conformidade", label: "Risco & Regras", icon: AlertTriangle },
    { id: "financeiro", label: "Financeiro & Lucro", icon: DollarSign },
  ];

  const deleteItem = (tab: TabType, id: string) => {
    setData((prev) => ({
      ...prev,
      [tab]: (prev[tab] as any[]).filter((item: any) => item.id !== id),
    }));
    toast.success("Item removido com sucesso!");
  };

  const saveItem = (tab: TabType, itemData: any) => {
    setData((prev) => {
      const list = [...(prev[tab] as any[])];
      if (itemData.id) {
        // Edit
        const index = list.findIndex((x) => x.id === itemData.id);
        if (index >= 0) list[index] = itemData;
        else list.push(itemData);
      } else {
        // Create new
        const newItem = { ...itemData, id: Math.random().toString(36).substring(2, 9) };
        list.push(newItem);
      }
      return { ...prev, [tab]: list };
    });
    setModalState(null);
    toast.success("Item salvo com sucesso!");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageTitle kicker="Central de Inteligência" title="Painel 360° da Operação Digital.">
          Dados consolidados de concorrentes, margem real por produto, saúde de fornecedores e alertas de conformidade.
        </PageTitle>

        <button
          onClick={resetToDefault}
          className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Restaurar Padrões
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/40 scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          const count = data[t.id]?.length || 0;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary/10 border border-primary/50 text-primary glow"
                  : "border border-border/40 bg-background/30 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.2 text-[10px] text-primary">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Header action button for active tab */}
      <div className="flex items-center justify-between border-b border-border/30 pb-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h2>
        <button
          onClick={() => setModalState({ tab: activeTab, item: null })}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110 transition shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar Novo Item
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "concorrencia" && (
          <ConcorrenciaSection
            items={data.concorrencia}
            onEdit={(item) => setModalState({ tab: "concorrencia", item })}
            onDelete={(id) => deleteItem("concorrencia", id)}
          />
        )}
        {activeTab === "desempenho" && (
          <DesempenhoSection
            items={data.desempenho}
            onEdit={(item) => setModalState({ tab: "desempenho", item })}
            onDelete={(id) => deleteItem("desempenho", id)}
          />
        )}
        {activeTab === "precificacao" && (
          <PrecificacaoSection
            items={data.precificacao}
            onEdit={(item) => setModalState({ tab: "precificacao", item })}
            onDelete={(id) => deleteItem("precificacao", id)}
          />
        )}
        {activeTab === "estoque" && (
          <EstoqueSection
            items={data.estoque}
            onEdit={(item) => setModalState({ tab: "estoque", item })}
            onDelete={(id) => deleteItem("estoque", id)}
          />
        )}
        {activeTab === "posvenda" && (
          <PosVendaSection
            items={data.posvenda}
            onEdit={(item) => setModalState({ tab: "posvenda", item })}
            onDelete={(id) => deleteItem("posvenda", id)}
          />
        )}
        {activeTab === "atendimento" && (
          <AtendimentoSection
            items={data.atendimento}
            onEdit={(item) => setModalState({ tab: "atendimento", item })}
            onDelete={(id) => deleteItem("atendimento", id)}
          />
        )}
        {activeTab === "tendencias" && (
          <TendenciasSection
            items={data.tendencias}
            onEdit={(item) => setModalState({ tab: "tendencias", item })}
            onDelete={(id) => deleteItem("tendencias", id)}
          />
        )}
        {activeTab === "reputacao" && (
          <ReputacaoSection
            items={data.reputacao}
            onEdit={(item) => setModalState({ tab: "reputacao", item })}
            onDelete={(id) => deleteItem("reputacao", id)}
          />
        )}
        {activeTab === "conformidade" && (
          <ConformidadeSection
            items={data.conformidade}
            onEdit={(item) => setModalState({ tab: "conformidade", item })}
            onDelete={(id) => deleteItem("conformidade", id)}
          />
        )}
        {activeTab === "financeiro" && (
          <FinanceiroSection
            items={data.financeiro}
            onEdit={(item) => setModalState({ tab: "financeiro", item })}
            onDelete={(id) => deleteItem("financeiro", id)}
          />
        )}
      </div>

      {/* Edit / Add Modal */}
      {modalState && (
        <ItemModal
          tab={modalState.tab}
          item={modalState.item}
          onClose={() => setModalState(null)}
          onSave={(itemData) => saveItem(modalState.tab, itemData)}
        />
      )}
    </div>
  );
}

// Section Components with Action Buttons
function ConcorrenciaSection({ items, onEdit, onDelete }: { items: CompetitorItem[]; onEdit: (item: CompetitorItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhum concorrente cadastrado." />;
  return (
    <div className="grid gap-3">
      {items.map((c) => (
        <div key={c.id} className="glass p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 relative group">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{c.name}</span>
              <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-primary font-medium">{c.platform}</span>
              <span className="text-xs text-amber-400 font-medium">{c.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">{c.product} · Estoque aparente: {c.stock} · {c.sales} vendas totais</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="num text-base font-bold text-foreground">{brl(c.price)}</p>
              <p className="text-[11px] text-rose-400">{c.lastChange}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 max-w-xs">
              <Bell className="h-3 w-3 inline mr-1" /> {c.alert}
            </div>
            <div className="flex items-center gap-1 border-l border-border/40 pl-3">
              <button onClick={() => onEdit(c)} title="Editar" className="p-1.5 text-muted-foreground hover:text-primary transition"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => onDelete(c.id)} title="Excluir" className="p-1.5 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DesempenhoSection({ items, onEdit, onDelete }: { items: DesempenhoItem[]; onEdit: (item: DesempenhoItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhum anúncio cadastrado no desempenho." />;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((ad) => (
        <div key={ad.id} className="glass p-4 space-y-3 relative flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${ad.margin.includes("3.") ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {ad.status}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit(ad)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => onDelete(ad.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <p className="font-semibold text-sm line-clamp-2">{ad.title}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/40 pt-2">
            <div><span className="text-muted-foreground">Views:</span> {ad.views}</div>
            <div><span className="text-muted-foreground">Cliques:</span> {ad.clicks}</div>
            <div><span className="text-muted-foreground">Conversão:</span> <span className="font-bold text-primary">{ad.conv}</span></div>
            <div><span className="text-muted-foreground">Margem Líq:</span> <span className="font-bold">{ad.margin}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PrecificacaoSection({ items, onEdit, onDelete }: { items: PrecificacaoItem[]; onEdit: (item: PrecificacaoItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhuma estratégia de precificação salva." />;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((p) => (
        <div key={p.id} className={`p-4 rounded-lg border ${p.isIdeal ? "border-primary/50 bg-primary/10 glow" : "border-border bg-background/30"} space-y-3 relative`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold ${p.isIdeal ? "text-primary" : "text-muted-foreground"}`}>{p.strategy}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(p)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(p.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <p className={`num text-2xl font-bold ${p.isIdeal ? "text-primary" : "text-emerald-400"}`}>{brl(p.price)}</p>
          <p className="text-[11px] text-muted-foreground">{p.description}</p>
        </div>
      ))}
    </div>
  );
}

function EstoqueSection({ items, onEdit, onDelete }: { items: EstoqueItem[]; onEdit: (item: EstoqueItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhum fornecedor cadastrado." />;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((s) => (
        <div key={s.id} className="glass p-4 space-y-2 relative">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{s.name}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(s)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(s.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{s.item} · Custo: {s.cost}</p>
          <div className="text-xs space-y-1 border-t border-border/40 pt-2">
            <p>Taxa de Defeito: <span className={parseFloat(s.defectRate) > 5 ? "text-rose-400 font-bold" : "text-emerald-400"}>{s.defectRate}</span></p>
            <p>Nível de Risco: <span className="font-semibold">{s.risk}</span></p>
            <p className="text-amber-400 mt-1 font-medium">{s.alert}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PosVendaSection({ items, onEdit, onDelete }: { items: PosVendaItem[]; onEdit: (item: PosVendaItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhuma métrica de pós-venda cadastrada." />;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
      {items.map((pv) => (
        <div key={pv.id} className="p-3 rounded-lg border border-border bg-background/30 relative space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-primary font-medium">{pv.status}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(pv)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => onDelete(pv.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{pv.label}</p>
          <p className="num text-2xl font-bold text-emerald-400">{pv.value}</p>
          <p className="text-[10px] text-muted-foreground">{pv.target}</p>
        </div>
      ))}
    </div>
  );
}

function AtendimentoSection({ items, onEdit, onDelete }: { items: AtendimentoItem[]; onEdit: (item: AtendimentoItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhuma dúvida cadastrada." />;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((f) => (
        <div key={f.id} className="glass p-4 space-y-2 relative">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-primary">"{f.question}"</p>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(f)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(f.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Volume de dúvidas: {f.freq}</p>
          <span className="inline-block text-[11px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
            ✓ {f.action}
          </span>
        </div>
      ))}
    </div>
  );
}

function TendenciasSection({ items, onEdit, onDelete }: { items: TendenciaItem[]; onEdit: (item: TendenciaItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhuma tendência cadastrada." />;
  return (
    <div className="grid gap-3 sm:grid-cols-3 text-xs">
      {items.map((t) => (
        <div key={t.id} className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 space-y-1 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">{t.badge || "Tendência"}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(t)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => onDelete(t.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <p className="font-bold text-foreground text-sm">{t.title}</p>
          <p className="text-muted-foreground leading-relaxed">{t.description}</p>
        </div>
      ))}
    </div>
  );
}

function ReputacaoSection({ items, onEdit, onDelete }: { items: ReputacaoItem[]; onEdit: (item: ReputacaoItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhuma métrica de reputação salva." />;
  return (
    <div className="grid gap-3">
      {items.map((r) => (
        <div key={r.id} className="glass p-6 space-y-4 relative">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-foreground">{r.score}</p>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                  {r.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(r)} title="Editar" className="p-2 border border-border rounded-lg text-muted-foreground hover:text-primary transition"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => onDelete(r.id)} title="Excluir" className="p-2 border border-border rounded-lg text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          {r.highlights && (
            <div className="text-xs space-y-1">
              <p className="font-semibold text-primary">Destaques e Elogios:</p>
              <p className="text-muted-foreground">{r.highlights}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ConformidadeSection({ items, onEdit, onDelete }: { items: ConformidadeItem[]; onEdit: (item: ConformidadeItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhuma regra de conformidade cadastrada." />;
  return (
    <div className="space-y-3 text-xs">
      {items.map((conf) => (
        <div key={conf.id} className={`p-4 rounded-lg border ${conf.riskLevel === "alto" ? "border-rose-500/40 bg-rose-500/10" : "border-amber-500/40 bg-amber-500/10"} flex items-center justify-between gap-4`}>
          <div className="space-y-1 min-w-0 flex-1">
            <p className={`font-semibold text-sm ${conf.riskLevel === "alto" ? "text-rose-400" : "text-amber-400"}`}>
              ⚠️ {conf.platform} — {conf.rule}
            </p>
            <p className="text-muted-foreground">{conf.warning}</p>
          </div>
          <div className="flex items-center gap-1 border-l border-border/40 pl-3">
            <button onClick={() => onEdit(conf)} title="Editar" className="p-1.5 text-muted-foreground hover:text-primary transition"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => onDelete(conf.id)} title="Excluir" className="p-1.5 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function FinanceiroSection({ items, onEdit, onDelete }: { items: FinanceiroItem[]; onEdit: (item: FinanceiroItem) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) return <EmptyState text="Nenhum indicador financeiro cadastrado." />;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
      {items.map((f) => (
        <div key={f.id} className="p-4 rounded-lg border border-border bg-background/30 relative space-y-1">
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => onEdit(f)} title="Editar" className="p-1 text-muted-foreground hover:text-primary transition"><Pencil className="h-3 w-3" /></button>
            <button onClick={() => onDelete(f.id)} title="Excluir" className="p-1 text-muted-foreground hover:text-rose-400 transition"><Trash2 className="h-3 w-3" /></button>
          </div>
          <p className="text-xs text-muted-foreground">{f.label}</p>
          <p className="num text-2xl font-bold text-foreground">{f.value}</p>
          {f.note && <p className="text-[10px] text-muted-foreground">{f.note}</p>}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="glass p-8 text-center text-sm text-muted-foreground rounded-lg">
      {text}
    </div>
  );
}

// Modal Form for Edit & Create
function ItemModal({ tab, item, onClose, onSave }: { tab: TabType; item: any; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState<any>(() => {
    if (item) return { ...item };
    switch (tab) {
      case "concorrencia":
        return { name: "", platform: "GGMAX", product: "", price: 0, lastChange: "", sales: 0, stock: "~10 un", rating: "5.0 ★", alert: "" };
      case "desempenho":
        return { title: "", views: 0, clicks: 0, conv: "0%", avgTicket: 0, margin: "0%", status: "Ativo" };
      case "precificacao":
        return { strategy: "", price: 0, marginPct: "20%", description: "", isIdeal: false };
      case "estoque":
        return { name: "", item: "", cost: "R$ 0", defectRate: "0%", risk: "Baixo", alert: "" };
      case "posvenda":
        return { label: "", value: "0%", target: "", status: "Normal" };
      case "atendimento":
        return { question: "", freq: "10% dos chamados", action: "" };
      case "tendencias":
        return { title: "", description: "", badge: "Nova" };
      case "reputacao":
        return { title: "", score: "5.0 ★", detail: "", highlights: "" };
      case "conformidade":
        return { platform: "GGMAX", rule: "", warning: "", riskLevel: "medio" };
      case "financeiro":
        return { label: "", value: "R$ 0", note: "" };
      default:
        return {};
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl p-6 space-y-4 shadow-2xl border border-primary/40">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="text-base font-bold text-foreground">
            {item ? "Editar Item" : "Novo Item"} — {tab.toUpperCase()}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === "concorrencia" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Nome da Loja</label>
                <input required type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Plataforma</label>
                  <input required type="text" value={formData.platform || ""} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Preço (R$)</label>
                  <input required type="number" step="0.01" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Produto Monitorado</label>
                <input required type="text" value={formData.product || ""} onChange={(e) => setFormData({ ...formData, product: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Estoque Aparente</label>
                  <input type="text" value={formData.stock || ""} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Nota do Vendedor</label>
                  <input type="text" value={formData.rating || ""} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Alerta / Ação Recente</label>
                <input type="text" value={formData.alert || ""} onChange={(e) => setFormData({ ...formData, alert: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "desempenho" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Título do Anúncio</label>
                <input required type="text" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Visualizações</label>
                  <input type="number" value={formData.views || 0} onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Cliques</label>
                  <input type="number" value={formData.clicks || 0} onChange={(e) => setFormData({ ...formData, clicks: parseInt(e.target.value) || 0 })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Taxa de Conversão</label>
                  <input type="text" value={formData.conv || ""} onChange={(e) => setFormData({ ...formData, conv: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Margem Líquida %</label>
                  <input type="text" value={formData.margin || ""} onChange={(e) => setFormData({ ...formData, margin: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Status / Categoria</label>
                <input type="text" value={formData.status || ""} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "precificacao" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Nome da Estratégia</label>
                <input required type="text" value={formData.strategy || ""} onChange={(e) => setFormData({ ...formData, strategy: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Preço Sugerido (R$)</label>
                  <input required type="number" step="0.01" value={formData.price || 0} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Margem Líquida %</label>
                  <input type="text" value={formData.marginPct || ""} onChange={(e) => setFormData({ ...formData, marginPct: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Descrição / Motivo</label>
                <input type="text" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isIdeal" checked={!!formData.isIdeal} onChange={(e) => setFormData({ ...formData, isIdeal: e.target.checked })} className="rounded border-input" />
                <label htmlFor="isIdeal" className="text-muted-foreground">Marcar como Preço Ideal Sugerido ⭐</label>
              </div>
            </>
          )}

          {tab === "estoque" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Nome do Fornecedor</label>
                <input required type="text" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Produto / Item Fornecido</label>
                <input required type="text" value={formData.item || ""} onChange={(e) => setFormData({ ...formData, item: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Custo por Lote/Un</label>
                  <input type="text" value={formData.cost || ""} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Taxa de Defeito</label>
                  <input type="text" value={formData.defectRate || ""} onChange={(e) => setFormData({ ...formData, defectRate: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Alerta / Status do Lote</label>
                <input type="text" value={formData.alert || ""} onChange={(e) => setFormData({ ...formData, alert: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "posvenda" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Nome da Métrica</label>
                <input required type="text" value={formData.label || ""} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-muted-foreground">Valor Medido</label>
                  <input required type="text" value={formData.value || ""} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block mb-1 text-muted-foreground">Meta / Objetivo</label>
                  <input type="text" value={formData.target || ""} onChange={(e) => setFormData({ ...formData, target: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
                </div>
              </div>
            </>
          )}

          {tab === "atendimento" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Dúvida Frequente</label>
                <input required type="text" value={formData.question || ""} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Volume de Dúvidas / Frequência</label>
                <input type="text" value={formData.freq || ""} onChange={(e) => setFormData({ ...formData, freq: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Ação Implementada</label>
                <input type="text" value={formData.action || ""} onChange={(e) => setFormData({ ...formData, action: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "tendencias" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Título do Evento / Tendência</label>
                <input required type="text" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Descrição e Oportunidade</label>
                <textarea rows={3} value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Selo / Tag</label>
                <input type="text" value={formData.badge || ""} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "reputacao" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Título / Selo da Reputação</label>
                <input required type="text" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Pontuação / Nota</label>
                <input required type="text" value={formData.score || ""} onChange={(e) => setFormData({ ...formData, score: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Detalhes das Avaliações</label>
                <input type="text" value={formData.detail || ""} onChange={(e) => setFormData({ ...formData, detail: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Destaques e Elogios</label>
                <input type="text" value={formData.highlights || ""} onChange={(e) => setFormData({ ...formData, highlights: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "conformidade" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Plataforma</label>
                <input required type="text" value={formData.platform || ""} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Regra / Ponto Crítico</label>
                <input required type="text" value={formData.rule || ""} onChange={(e) => setFormData({ ...formData, rule: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Aviso / Consequência</label>
                <textarea rows={2} value={formData.warning || ""} onChange={(e) => setFormData({ ...formData, warning: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          {tab === "financeiro" && (
            <>
              <div>
                <label className="block mb-1 text-muted-foreground">Nome do Indicador</label>
                <input required type="text" value={formData.label || ""} onChange={(e) => setFormData({ ...formData, label: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Valor em R$ ou %</label>
                <input required type="text" value={formData.value || ""} onChange={(e) => setFormData({ ...formData, value: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block mb-1 text-muted-foreground">Observação</label>
                <input type="text" value={formData.note || ""} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary" />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:bg-accent">
              Cancelar
            </button>
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
