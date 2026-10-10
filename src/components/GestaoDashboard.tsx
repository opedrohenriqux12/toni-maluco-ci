import { useState, useMemo, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line
} from "recharts";
import { 
  DollarSign, TrendingUp, TrendingDown, ShoppingBag, Percent, ArrowUpRight, ArrowDownRight, 
  Package, Target, Calendar, Download, Plus, Users, AlertCircle, CheckCircle2, MessageSquare,
  BarChart3, Wallet, Receipt, Scale, CheckSquare, PieChart as PieIcon, Truck, Sliders, ShieldAlert,
  Compass, AlertTriangle, Star, Bell, FileText, BookOpen, Settings, HelpCircle, AlertOctagon, Clock, Award,
  ChevronLeft, ChevronRight, Trash2, X, Maximize2, Minimize2, Eye, EyeOff, BarChart2, LineChart as LineIcon, Layers
} from "lucide-react";
import { brl } from "@/lib/data";
import { toast } from "sonner";

const glassTip = { 
  background: "color-mix(in oklab, var(--card) 85%, transparent)", 
  border: "1px solid var(--border)", 
  borderRadius: 10, 
  backdropFilter: "blur(12px)", 
  fontSize: 12 
};

export function GestaoDashboard({ activeAba = "painel" }: { activeAba?: string }) {
  const [period, setPeriod] = useState("30d");
  const [comparePrevious, setComparePrevious] = useState(true);
  const [showDataModal, setShowDataModal] = useState(false);

  const [annotations, setAnnotations] = useState<Array<{ id: string; date: string; text: string }>>([
    { id: "1", date: "2026-10-05", text: "Troca de fornecedor principal de Valorant Points" }
  ]);
  const [newAnnotation, setNewAnnotation] = useState("");

  // What-If Simulator state
  const [simPriceChange, setSimPriceChange] = useState(0); // %
  const [simVolumeChange, setSimVolumeChange] = useState(0); // %
  const [simCostChange, setSimCostChange] = useState(0); // %

  // Dynamic calculations based on selected period
  const periodData = useMemo(() => {
    switch (period) {
      case "hoje":
        return {
          label: "Hoje",
          grossRevenue: 98000,
          totalFees: 12250,
          totalCost: 61000,
          totalRefunds: 0,
          netProfit: 24750,
          netMarginPct: 25.3,
          totalOrders: 9,
          avgTicket: 10888,
          changePct: "+8.5% vs ontem",
          stockCapital: 620000,
          goalText: "Meta Diária: R$ 266,66 de Lucro Líquido",
          goalPct: 92.8,
          goalAmount: 24750,
          revenueOverTime: [
            { date: "06:00", receita: 180, lucro: 45, margem: 25.0 },
            { date: "12:00", receita: 320, lucro: 80, margem: 25.0 },
            { date: "18:00", receita: 290, lucro: 72, margem: 24.8 },
            { date: "22:00", receita: 190, lucro: 50.5, margem: 26.5 },
          ],
          profitByPlat: [
            { name: "GGMAX", lucro: 140 },
            { name: "Eneba", lucro: 75 },
            { name: "Gamemarket", lucro: 20 },
            { name: "Mercado Livre", lucro: 12.5 },
          ],
          compositionData: [
            { name: "Lucro Líquido", value: 247.5, color: "var(--invest)" },
            { name: "Custo Produtos", value: 610, color: "#64748b" },
            { name: "Taxas Plataformas", value: 122.5, color: "var(--avoid)" },
            { name: "Reembolsos", value: 0, color: "var(--test)" },
          ],
        };

      case "7d":
        return {
          label: "7 Dias",
          grossRevenue: 585000,
          totalFees: 73125,
          totalCost: 362000,
          totalRefunds: 18000,
          netProfit: 131875,
          netMarginPct: 22.5,
          totalOrders: 52,
          avgTicket: 11250,
          changePct: "+11.4% vs ant.",
          stockCapital: 620000,
          goalText: "Meta Semanal: R$ 1.866,00 de Lucro Líquido",
          goalPct: 70.7,
          goalAmount: 131875,
          revenueOverTime: [
            { date: "Seg", receita: 810, lucro: 180, margem: 22.2 },
            { date: "Ter", receita: 790, lucro: 175, margem: 22.1 },
            { date: "Qua", receita: 850, lucro: 190, margem: 22.3 },
            { date: "Qui", receita: 920, lucro: 210, margem: 22.8 },
            { date: "Sex", receita: 1100, lucro: 250, margem: 22.7 },
            { date: "Sáb", receita: 880, lucro: 195, margem: 22.1 },
            { date: "Dom", receita: 500, lucro: 118.75, margem: 23.75 },
          ],
          profitByPlat: [
            { name: "GGMAX", lucro: 680 },
            { name: "Eneba", lucro: 420 },
            { name: "Gamemarket", lucro: 135 },
            { name: "Mercado Livre", lucro: 83.75 },
          ],
          compositionData: [
            { name: "Lucro Líquido", value: 1318.75, color: "var(--invest)" },
            { name: "Custo Produtos", value: 3620, color: "#64748b" },
            { name: "Taxas Plataformas", value: 731.25, color: "var(--avoid)" },
            { name: "Reembolsos", value: 180, color: "var(--test)" },
          ],
        };

      case "90d":
        return {
          label: "90 Dias",
          grossRevenue: 7140000,
          totalFees: 892500,
          totalCost: 4420000,
          totalRefunds: 210000,
          netProfit: 1617500,
          netMarginPct: 22.6,
          totalOrders: 620,
          avgTicket: 11516,
          changePct: "+19.8% vs ant.",
          stockCapital: 620000,
          goalText: "Meta Trimestral: R$ 24.000,00 de Lucro Líquido",
          goalPct: 67.4,
          goalAmount: 1617500,
          revenueOverTime: [
            { date: "Agosto", receita: 21800, lucro: 4900, margem: 22.4 },
            { date: "Setembro", receita: 24750, lucro: 5725, margem: 23.1 },
            { date: "Outubro", receita: 24850, lucro: 5550, margem: 22.3 },
          ],
          profitByPlat: [
            { name: "GGMAX", lucro: 8200 },
            { name: "Eneba", lucro: 5600 },
            { name: "Gamemarket", lucro: 1450 },
            { name: "Mercado Livre", lucro: 925 },
          ],
          compositionData: [
            { name: "Lucro Líquido", value: 16175, color: "var(--invest)" },
            { name: "Custo Produtos", value: 44200, color: "#64748b" },
            { name: "Taxas Plataformas", value: 8925, color: "var(--avoid)" },
            { name: "Reembolsos", value: 2100, color: "var(--test)" },
          ],
        };

      case "ano":
        return {
          label: "Ano",
          grossRevenue: 26800000,
          totalFees: 3350000,
          totalCost: 16500000,
          totalRefunds: 780000,
          netProfit: 6170000,
          netMarginPct: 23.0,
          totalOrders: 2340,
          avgTicket: 11453,
          changePct: "+28.4% vs ant.",
          stockCapital: 620000,
          goalText: "Meta Anual: R$ 96.000,00 de Lucro Líquido",
          goalPct: 64.3,
          goalAmount: 6170000,
          revenueOverTime: [
            { date: "Jan", receita: 18500, lucro: 4100, margem: 22.1 },
            { date: "Fev", receita: 19200, lucro: 4300, margem: 22.3 },
            { date: "Mar", receita: 21000, lucro: 4800, margem: 22.8 },
            { date: "Abr", receita: 20500, lucro: 4600, margem: 22.4 },
            { date: "Mai", receita: 22800, lucro: 5200, margem: 22.8 },
            { date: "Jun", receita: 23500, lucro: 5400, margem: 22.9 },
            { date: "Jul", receita: 24100, lucro: 5600, margem: 23.2 },
            { date: "Ago", receita: 21800, lucro: 4900, margem: 22.4 },
            { date: "Set", receita: 24750, lucro: 5725, margem: 23.1 },
            { date: "Out", receita: 24850, lucro: 5550, margem: 22.3 },
            { date: "Nov", receita: 22000, lucro: 5000, margem: 22.7 },
            { date: "Dez", receita: 25000, lucro: 6530, margem: 26.1 },
          ],
          profitByPlat: [
            { name: "GGMAX", lucro: 31000 },
            { name: "Eneba", lucro: 21500 },
            { name: "Gamemarket", lucro: 5400 },
            { name: "Mercado Livre", lucro: 3800 },
          ],
          compositionData: [
            { name: "Lucro Líquido", value: 61700, color: "var(--invest)" },
            { name: "Custo Produtos", value: 165000, color: "#64748b" },
            { name: "Taxas Plataformas", value: 33500, color: "var(--avoid)" },
            { name: "Reembolsos", value: 7800, color: "var(--test)" },
          ],
        };

      default: // 30d / mes
        return {
          label: "30 Dias / Mês Atual",
          grossRevenue: 2485000,
          totalFees: 312000,
          totalCost: 1540000,
          totalRefunds: 78000,
          netProfit: 555000,
          netMarginPct: 22.3,
          totalOrders: 214,
          avgTicket: 11612,
          changePct: "+14.2% vs ant.",
          stockCapital: 620000,
          goalText: "Meta do Mês: R$ 8.000,00 de Lucro Líquido",
          goalPct: 69.3,
          goalAmount: 555000,
          revenueOverTime: [
            { date: "Semana 1", receita: 5400, lucro: 1200, margem: 22.2 },
            { date: "Semana 2", receita: 6200, lucro: 1450, margem: 23.3 },
            { date: "Semana 3", receita: 5900, lucro: 1300, margem: 22.0 },
            { date: "Semana 4", receita: 7350, lucro: 1600, margem: 21.7 },
          ],
          profitByPlat: [
            { name: "GGMAX", lucro: 2850 },
            { name: "Eneba", lucro: 1950 },
            { name: "Gamemarket", lucro: 450 },
            { name: "Mercado Livre", lucro: 300 },
          ],
          compositionData: [
            { name: "Lucro Líquido", value: 5550, color: "var(--invest)" },
            { name: "Custo Produtos", value: 15400, color: "#64748b" },
            { name: "Taxas Plataformas", value: 3120, color: "var(--avoid)" },
            { name: "Reembolsos", value: 780, color: "var(--test)" },
          ],
        };
    }
  }, [period]);

  // Simulated results for What-If scenario
  const simulatedRevenue = periodData.grossRevenue * (1 + simPriceChange / 100) * (1 + simVolumeChange / 100);
  const simulatedCost = periodData.totalCost * (1 + simCostChange / 100) * (1 + simVolumeChange / 100);
  const simulatedFees = simulatedRevenue * (periodData.totalFees / periodData.grossRevenue);
  const simulatedNetProfit = simulatedRevenue - simulatedCost - simulatedFees - periodData.totalRefunds;

  const transactions = useMemo(() => [
    { id: "tx-1", date: "2026-10-10", plat: "ggmax", prod: "Valorant Points 1000", val: 4200, fee: 609, cost: 3100, profit: 491, status: "pago" },
    { id: "tx-2", date: "2026-10-09", plat: "eneba", prod: "FC 26 Points 2800", val: 11900, fee: 1547, cost: 8400, profit: 1953, status: "pago" },
    { id: "tx-3", date: "2026-10-08", plat: "gamemarket", prod: "Gift Card Steam R$50", val: 5400, fee: 702, cost: 4900, profit: -202, status: "pago" },
    { id: "tx-4", date: "2026-10-07", plat: "ggmax", prod: "Conta LoL Smurf Nv.30", val: 3500, fee: 507, cost: 1200, profit: 1793, status: "reembolsado" },
    { id: "tx-5", date: "2026-10-06", plat: "ggmax", prod: "Robux 800", val: 4600, fee: 667, cost: 3600, profit: 333, status: "pago" },
  ], []);

  const addAnnotation = () => {
    if (!newAnnotation.trim()) return;
    setAnnotations((prev) => [
      { id: Date.now().toString(), date: new Date().toLocaleDateString("pt-BR"), text: newAnnotation },
      ...prev,
    ]);
    setNewAnnotation("");
    toast.success("Anotação adicionada à linha do tempo!");
  };

  // Render tab based on activeAba
  return (
    <div className="space-y-6 rise">
      {/* 1. PAINEL EXECUTIVO */}
      {(activeAba === "painel" || !activeAba) && (
        <div className="space-y-6">
          {/* Top 6 Strategic Key Numbers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="num text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Award className="h-4 w-4" /> 6 Números-Chave Estratégicos da Operação
              </p>
              <span className="text-[10px] text-muted-foreground">Atualizado em tempo real</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {/* 1. Ponto de Equilíbrio */}
              <div className="glass p-3.5 space-y-1 hover:border-primary/40 transition">
                <p className="text-[11px] text-muted-foreground">1. Ponto de Equilíbrio</p>
                <p className="num text-base font-bold text-foreground">R$ 18.520</p>
                <p className="text-[10px] text-emerald-400 font-medium">Faltam 32 vendas</p>
                <span className="inline-block text-[9px] text-primary bg-primary/10 px-1.5 py-0.2 rounded mt-1">fato</span>
              </div>

              {/* 2. Dias de Caixa */}
              <div className="glass p-3.5 space-y-1 hover:border-primary/40 transition">
                <p className="text-[11px] text-muted-foreground">2. Dias de Caixa</p>
                <p className="num text-base font-bold text-emerald-400">42 Dias</p>
                <p className="text-[10px] text-muted-foreground">Caixa R$ 32.400</p>
                <span className="inline-block text-[9px] text-primary bg-primary/10 px-1.5 py-0.2 rounded mt-1">estimativa</span>
              </div>

              {/* 3. % Lucro por Plataforma (Dependência) */}
              <div className="glass p-3.5 space-y-1 hover:border-primary/40 transition">
                <p className="text-[11px] text-muted-foreground">3. Dependência GGMAX</p>
                <p className="num text-base font-bold text-amber-400">51.3%</p>
                <p className="text-[10px] text-amber-300">Alerta: Risco alto</p>
                <span className="inline-block text-[9px] text-primary bg-primary/10 px-1.5 py-0.2 rounded mt-1">fato</span>
              </div>

              {/* 4. Retorno por R$ em Estoque */}
              <div className="glass p-3.5 space-y-1 hover:border-primary/40 transition">
                <p className="text-[11px] text-muted-foreground">4. Retorno p/ R$ Estoque</p>
                <p className="num text-base font-bold text-emerald-400">R$ 2,45</p>
                <p className="text-[10px] text-muted-foreground">por R$ 1,00 retido</p>
                <span className="inline-block text-[9px] text-primary bg-primary/10 px-1.5 py-0.2 rounded mt-1">fato</span>
              </div>

              {/* 5. Lucro por Hora Trabalhada */}
              <div className="glass p-3.5 space-y-1 hover:border-primary/40 transition">
                <p className="text-[11px] text-muted-foreground">5. Lucro por Hora</p>
                <p className="num text-base font-bold text-primary">R$ 138,75/h</p>
                <p className="text-[10px] text-muted-foreground">Base: 40h/mês</p>
                <span className="inline-block text-[9px] text-primary bg-primary/10 px-1.5 py-0.2 rounded mt-1">estimativa</span>
              </div>

              {/* 6. Produtos Margem em Queda */}
              <div className="glass p-3.5 space-y-1 hover:border-primary/40 transition">
                <p className="text-[11px] text-muted-foreground">6. Queda Margem 3w+</p>
                <p className="num text-base font-bold text-rose-400">2 Produtos</p>
                <p className="text-[10px] text-rose-300">Steam / CS2 Skins</p>
                <span className="inline-block text-[9px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded mt-1">alerta</span>
              </div>
            </div>
          </div>

          {/* Toolbar & Filters */}
          <div className="glass flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Período:
              </span>
              {["hoje", "7d", "30d", "mes", "90d", "ano"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    period === p ? "bg-primary text-primary-foreground font-medium" : "bg-background/40 hover:bg-accent text-muted-foreground"
                  }`}
                >
                  {p === "hoje" ? "Hoje" : p === "7d" ? "7 Dias" : p === "30d" ? "30 Dias" : p === "mes" ? "Mês Atual" : p === "90d" ? "90 Dias" : "Ano"}
                </button>
              ))}
              <label className="ml-2 flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={comparePrevious}
                  onChange={(e) => setComparePrevious(e.target.checked)}
                  className="rounded border-border bg-background text-primary"
                />
                Comparar com anterior
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDataModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary/20 border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30"
              >
                <Plus className="h-3.5 w-3.5" /> Lançar Dados
              </button>
              <button
                onClick={() => toast.success(`Exportando relatório completo do período ${periodData.label} (CSV/PDF)...`)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Download className="h-3.5 w-3.5" /> Exportar
              </button>
            </div>
          </div>

          {/* Financial KPI Cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <div className="glass p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                Receita Bruta <DollarSign className="h-3.5 w-3.5" />
              </div>
              <p className="num text-xl font-bold">{brl(periodData.grossRevenue / 100)}</p>
              <p className="text-[11px] text-emerald-400 flex items-center"><ArrowUpRight className="h-3 w-3" /> {periodData.changePct}</p>
            </div>

            <div className="glass p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                Taxas Plataformas <Percent className="h-3.5 w-3.5" />
              </div>
              <p className="num text-xl font-bold text-rose-400">{brl(periodData.totalFees / 100)}</p>
              <p className="text-[11px] text-muted-foreground">{((periodData.totalFees / periodData.grossRevenue) * 100).toFixed(1)}% da receita</p>
            </div>

            <div className="glass p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                Custo Produtos (CMV) <Package className="h-3.5 w-3.5" />
              </div>
              <p className="num text-xl font-bold text-muted-foreground">{brl(periodData.totalCost / 100)}</p>
              <p className="text-[11px] text-muted-foreground">{((periodData.totalCost / periodData.grossRevenue) * 100).toFixed(1)}% da receita</p>
            </div>

            <div className="glass glow shimmer-border p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-primary font-semibold">
                Lucro Líquido <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <p className="num text-2xl font-bold text-emerald-400">{brl(periodData.netProfit / 100)}</p>
              <p className="text-[11px] text-emerald-400 flex items-center"><ArrowUpRight className="h-3 w-3" /> {periodData.changePct}</p>
            </div>

            <div className="glass p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                Margem Líquida % <Percent className="h-3.5 w-3.5" />
              </div>
              <p className="num text-xl font-bold text-primary">{periodData.netMarginPct.toFixed(1)}%</p>
              <p className="text-[11px] text-emerald-400">Acima do mín (15%)</p>
            </div>

            <div className="glass p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                Nº de Pedidos <ShoppingBag className="h-3.5 w-3.5" />
              </div>
              <p className="num text-xl font-bold">{periodData.totalOrders}</p>
              <p className="text-[11px] text-muted-foreground">Ticket Médio: {brl(periodData.avgTicket / 100)}</p>
            </div>
          </div>

          {/* Meta Progress Bar */}
          <div className="glass p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Target className="h-4 w-4 text-primary" /> {periodData.goalText}
              </span>
              <span className="num font-bold text-primary">{periodData.goalPct}% Atingido ({brl(periodData.goalAmount / 100)})</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-500 glow" style={{ width: `${Math.min(100, periodData.goalPct)}%` }} />
            </div>
          </div>

          {/* Charts Dashboard (ProChartSuite) */}
          <ProChartSuite periodData={periodData} />

          {/* Timeline & Transactions */}
          <div className="glass p-5 space-y-4">
            <h3 className="text-base font-bold">Extrato de Transações Conciliadas</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                    <th className="py-2">Data</th>
                    <th className="py-2">Plataforma</th>
                    <th className="py-2">Produto</th>
                    <th className="py-2 text-right">Valor</th>
                    <th className="py-2 text-right">Taxa</th>
                    <th className="py-2 text-right">Custo</th>
                    <th className="py-2 text-right">Lucro</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-accent/30">
                      <td className="py-2.5">{tx.date}</td>
                      <td className="py-2.5 uppercase font-semibold text-primary">{tx.plat}</td>
                      <td className="py-2.5 font-medium">{tx.prod}</td>
                      <td className="py-2.5 text-right num">{brl(tx.val / 100)}</td>
                      <td className="py-2.5 text-right num text-rose-400">-{brl(tx.fee / 100)}</td>
                      <td className="py-2.5 text-right num text-muted-foreground">-{brl(tx.cost / 100)}</td>
                      <td className={`py-2.5 text-right num font-bold ${tx.profit < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {brl(tx.profit / 100)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${tx.status === "pago" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. DRE E RESULTADOS */}
      {activeAba === "dre" && (
        <div className="glass p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Demonstração do Resultado do Exercício (DRE)
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Demonstrativo financeiro completo auditado por período.</p>
            </div>
            <button onClick={() => toast.success("DRE exportada com sucesso em PDF/CSV!")} className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/40 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/20">
              <Download className="h-3.5 w-3.5" /> Exportar DRE
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-border/20 font-semibold">
              <span>(+) RECEITA OPERACIONAL BRUTA</span>
              <span className="num text-foreground">R$ 24.850,00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-muted-foreground">
              <span>(-) Impostos Diretos (Simples Nacional 6%)</span>
              <span className="num text-rose-400">-R$ 1.491,00</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/20 font-semibold text-primary">
              <span>(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span className="num">R$ 23.359,00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-muted-foreground">
              <span>(-) CMV (Custo das Mercadorias Vendidas)</span>
              <span className="num text-rose-400">-R$ 15.400,00</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/20 font-semibold">
              <span>(=) LUCRO BRUTO (Margem Bruta 34.1%)</span>
              <span className="num text-emerald-400">R$ 7.959,00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-muted-foreground">
              <span>(-) Taxas de Intermediação dos Marketplaces</span>
              <span className="num text-rose-400">-R$ 3.120,00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-muted-foreground">
              <span>(-) Despesas Fixas (VPS, Softwares, Servidores)</span>
              <span className="num text-rose-400">-R$ 890,00</span>
            </div>
            <div className="flex justify-between py-1.5 pl-4 text-muted-foreground">
              <span>(-) Disputas e Reembolsos</span>
              <span className="num text-rose-400">-R$ 780,00</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-primary/50 text-base font-bold bg-primary/10 px-3 rounded-lg">
              <span className="text-primary flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> (=) LUCRO LÍQUIDO FINAL NO BOLSO</span>
              <span className="num text-emerald-400">R$ 3.169,00</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. FLUXO DE CAIXA */}
      {activeAba === "fluxo-caixa" && (
        <div className="glass p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Fluxo de Caixa & Projeção 30/60/90 Dias
            </h2>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">Caixa Saudável</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-center">
            <div className="p-4 rounded-lg border border-border bg-background/30">
              <p className="text-xs text-muted-foreground">Saldo Projetado em 30 Dias</p>
              <p className="num text-2xl font-bold text-emerald-400 mt-1">R$ 37.950,00</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/30">
              <p className="text-xs text-muted-foreground">Saldo Projetado em 60 Dias</p>
              <p className="num text-2xl font-bold text-emerald-400 mt-1">R$ 43.500,00</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/30">
              <p className="text-xs text-muted-foreground">Saldo Projetado em 90 Dias</p>
              <p className="num text-2xl font-bold text-primary mt-1">R$ 48.575,00</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTAS E PLATAFORMAS */}
      {activeAba === "contas-plataformas" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Saldo & Prazos de Liberação por Plataforma
          </h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { plat: "GGMAX", disponivel: "R$ 4.250", pendente: "R$ 1.890", prazo: "2 dias úteis", disputa: "R$ 350" },
              { plat: "Eneba", disponivel: "R$ 2.100", pendente: "R$ 3.400", prazo: "5 dias úteis", disputa: "R$ 0" },
              { plat: "Gamemarket", disponivel: "R$ 890", pendente: "R$ 420", prazo: "3 dias úteis", disputa: "R$ 180" },
              { plat: "Mercado Livre", disponivel: "R$ 1.450", pendente: "R$ 980", prazo: "Imediato", disputa: "R$ 0" },
            ].map((p, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border/50 bg-background/30 space-y-2 text-xs">
                <p className="font-bold text-sm text-primary uppercase">{p.plat}</p>
                <p><span className="text-muted-foreground">Disponível:</span> <span className="font-bold text-emerald-400">{p.disponivel}</span></p>
                <p><span className="text-muted-foreground">A Liberar:</span> {p.pendente}</p>
                <p><span className="text-muted-foreground">Prazo médio:</span> {p.prazo}</p>
                <p><span className="text-muted-foreground">Em Disputa:</span> <span className="text-rose-400">{p.disputa}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CUSTOS E DESPESAS */}
      {activeAba === "custos-despesas" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Lançamento & Detalhamento de Custos Fixos e Variáveis
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-4 rounded-lg border border-border bg-background/30 space-y-2">
              <h3 className="font-bold text-sm text-primary">Custos Fixos Mensais (R$ 890,00)</h3>
              <p>• Servidor VPS & Proxies: R$ 320,00/mês</p>
              <p>• Licenças de Software & Bots: R$ 270,00/mês</p>
              <p>• Conexão Dedicada / Anti-DDoS: R$ 300,00/mês</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/30 space-y-2">
              <h3 className="font-bold text-sm text-primary">Custos Variáveis por Venda</h3>
              <p>• Taxa GGMAX: 14.5% + R$ 0,50 por venda</p>
              <p>• Taxa Eneba: 13% sobre o valor anunciado</p>
              <p>• Custo de Reposição por Defeito: ~2.1% médio</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. IMPOSTOS E RETIRADAS */}
      {activeAba === "impostos-retiradas" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" /> Reserva Fiscal & Retiradas (Pró-Labore)
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="p-4 rounded-lg border border-border bg-background/30 space-y-2">
              <p className="font-bold text-sm text-primary">Regime Tributário</p>
              <p className="text-muted-foreground">Simples Nacional — Anexo III (Alíquota estimada: 6%)</p>
              <p className="text-amber-400 font-semibold mt-2">Reserva Sugerida: R$ 1.491,00/mês</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/30 space-y-2">
              <p className="font-bold text-sm text-emerald-400">Pró-Labore Registrado</p>
              <p className="num text-2xl font-bold">R$ 3.000,00</p>
              <p className="text-muted-foreground">Transferência mensal programada</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/30 space-y-2">
              <p className="font-bold text-sm text-primary">Lucro Remanescente Reinvestido</p>
              <p className="num text-2xl font-bold text-primary">R$ 2.550,00</p>
              <p className="text-muted-foreground">Destinado ao capital de giro do estoque</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONCILIAÇÃO */}
      {activeAba === "conciliacao" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" /> Conciliação de Vendas x Recebimentos
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 flex justify-between items-center">
              <span>✓ GGMAX Conciliado — 142 transações checadas</span>
              <span className="font-bold text-emerald-400">100% Batido</span>
            </div>
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex justify-between items-center">
              <span>⚠️ Eneba — Divergência pontual de R$ 12,50 na taxa da ordem #8921</span>
              <button onClick={() => toast.success("Divergência notificada para revisão!")} className="text-amber-300 font-semibold underline">Revisar</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RENTABILIDADE POR PRODUTO */}
      {activeAba === "rentabilidade" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-primary" /> Matriz de Rentabilidade por Produto
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="p-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 space-y-1">
              <p className="font-bold text-emerald-400 text-sm">🌟 Estrelas (Alta Margem & Alto Giro)</p>
              <p>• Valorant Points 1000 — Margem: 26.1% · Giro: 142v/mês</p>
            </div>
            <div className="p-4 rounded-lg border border-primary/40 bg-primary/10 space-y-1">
              <p className="font-bold text-primary text-sm">🐮 Vacas Leiteiras (Margem Estável & Giro Alto)</p>
              <p>• FC 26 Points 2800 — Margem: 29.4% · Giro: 58v/mês</p>
            </div>
            <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 space-y-1">
              <p className="font-bold text-amber-400 text-sm">❓ Interrogações (Alta Margem & Baixo Giro)</p>
              <p>• Contas LoL Smurf Nv.30 — Margem: 51.2% · Giro: 12v/mês</p>
            </div>
            <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-500/10 space-y-1">
              <p className="font-bold text-rose-400 text-sm">🍍 Abacaxis (Baixa Margem & Baixo Giro)</p>
              <p>• Gift Card Steam R$50 — Margem: 3.2% · Retém R$4.900 de capital</p>
            </div>
          </div>
        </div>
      )}

      {/* 9. ESTOQUE E CAPITAL PARADO */}
      {activeAba === "estoque-parado" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Capital Parado em Estoque & Risco de Validade
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="p-4 rounded-lg border border-border bg-background/30">
              <p className="text-muted-foreground">Total em Estoque</p>
              <p className="num text-2xl font-bold text-foreground mt-1">R$ 6.200,00</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/30">
              <p className="text-muted-foreground">Tempo Médio até Vender</p>
              <p className="num text-2xl font-bold text-emerald-400 mt-1">4.2 dias</p>
            </div>
            <div className="p-4 rounded-lg border border-rose-500/40 bg-rose-500/10">
              <p className="text-rose-400 font-semibold">Itens Parados &gt; 30 dias</p>
              <p className="num text-2xl font-bold text-rose-400 mt-1">R$ 850,00</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. FORNECEDORES */}
      {activeAba === "fornecedores" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Scorecard & Qualidade de Fornecedores
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            {[
              { name: "GlobalKeys Direct", item: "VP Gift Cards", cost: "R$ 31,00", defect: "0.4%", score: "4.9 ★" },
              { name: "SkinsExpress EU", item: "CS2 Skins", cost: "R$ 150,00", defect: "3.2%", score: "4.2 ★" },
              { name: "DigitalAccounts Asia", item: "Contas LoL", cost: "R$ 12,00", defect: "14.8%", score: "2.8 ★ (Risco)" },
            ].map((f, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-background/30 space-y-1">
                <p className="font-bold text-sm text-foreground">{f.name}</p>
                <p className="text-muted-foreground">{f.item} · Custo: {f.cost}</p>
                <p>Taxa Defeito: <span className={f.defect.includes("14") ? "text-rose-400 font-bold" : "text-emerald-400"}>{f.defect}</span></p>
                <p>Nota Qualidade: <span className="font-bold text-amber-400">{f.score}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. METAS E OKRS */}
      {activeAba === "metas-okrs" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Metas Mensais e Desdobramento Semanal (OKRs)
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span>OKR 1: Lucro Líquido Mensal &gt; R$ 8.000</span>
                <span className="font-bold text-primary">69.3% Atingido</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: "69.3%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>OKR 2: Manter Taxa de Defeito &lt; 1.5%</span>
                <span className="font-bold text-emerald-400">100% Batido (1.2%)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. PLANEJAMENTO E CENÁRIOS */}
      {activeAba === "cenarios" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" /> Simulador de Cenários "E Se..."
          </h2>
          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block mb-1 text-muted-foreground">Variação de Preço ({simPriceChange > 0 ? `+${simPriceChange}` : simPriceChange}%)</label>
              <input type="range" min="-20" max="20" value={simPriceChange} onChange={(e) => setSimPriceChange(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block mb-1 text-muted-foreground">Variação de Volume ({simVolumeChange > 0 ? `+${simVolumeChange}` : simVolumeChange}%)</label>
              <input type="range" min="-30" max="50" value={simVolumeChange} onChange={(e) => setSimVolumeChange(parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block mb-1 text-muted-foreground">Variação de Custo CMV ({simCostChange > 0 ? `+${simCostChange}` : simCostChange}%)</label>
              <input type="range" min="-20" max="20" value={simCostChange} onChange={(e) => setSimCostChange(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>

          <div className="p-4 rounded-lg border border-primary/40 bg-primary/10 text-center space-y-1">
            <p className="text-xs text-primary font-bold">Lucro Líquido Projetado no Cenário Simulado</p>
            <p className="num text-3xl font-bold text-emerald-400">{brl(simulatedNetProfit / 100)}</p>
            <p className="text-[11px] text-muted-foreground">Diferença vs Atual: {brl((simulatedNetProfit - periodData.netProfit) / 100)}</p>
          </div>
        </div>
      )}

      {/* 13. PORTFÓLIO E RISCO */}
      {activeAba === "risco-concentracao" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" /> Análise de Risco de Concentração
          </h2>
          <div className="p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs space-y-2">
            <p className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" /> Alerta de Concentração de Lucro
            </p>
            <p className="text-muted-foreground">
              A plataforma **GGMAX** é responsável por **51.3%** do seu lucro total. Recomendamos diversificar o volume de vendas para a Eneba ou Gamemarket para mitigar riscos de suspensão ou bloqueio abrupto.
            </p>
          </div>
        </div>
      )}

      {/* 14. MAPA DE MERCADO */}
      {activeAba === "mapa-mercado" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" /> Mapa de Posição de Mercado & Concorrência
          </h2>
          <p className="text-xs text-muted-foreground">Seu posicionamento atual em relação aos 5 principais vendedores da sua categoria.</p>
          <div className="p-4 rounded-lg border border-border bg-background/30 text-xs text-center font-semibold text-emerald-400">
            🥇 2º Lugar em Volume de Vendas de Valorant Points na GGMAX
          </div>
        </div>
      )}

      {/* 15. CALENDÁRIO ESTRATÉGICO */}
      {activeAba === "calendario" && <CalendarioSection />}

      {/* 16. RISCOS E CONFORMIDADE */}
      {activeAba === "riscos-conformidade" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" /> Matriz de Riscos & Conformidade
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10">
              <p className="font-bold text-rose-400">🔴 Risco Alto: Promessas de "100% sem ban" em Anúncios</p>
              <p className="text-muted-foreground mt-0.5">Fere as diretrizes do marketplace. Substituído em todas as copies otimizadas.</p>
            </div>
          </div>
        </div>
      )}

      {/* 17. REPUTAÇÃO */}
      {activeAba === "reputacao" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" /> Indicadores de Reputação
          </h2>
          <div className="p-4 rounded-lg border border-border bg-background/30 text-xs">
            <p className="font-bold text-base">4.92 / 5.0 ★ (1.480 avaliações)</p>
            <p className="text-muted-foreground mt-1">98.4% de qualificações positivas no GGMAX e Eneba.</p>
          </div>
        </div>
      )}

      {/* 18. ALERTAS DE GESTÃO */}
      {activeAba === "alertas-gestao" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Alertas de Gestão Pendentes (3)
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10">
              <span className="font-bold text-rose-400">1. Alerta de Margem:</span> Gift Card Steam com margem abaixo do mínimo configurável (3.2%).
            </div>
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
              <span className="font-bold text-amber-400">2. Alerta de Estoque:</span> Reposição de CS2 Skins necessária em até 2 dias.
            </div>
            <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10">
              <span className="font-bold text-amber-400">3. Alerta de Concentração:</span> Mais de 50% dos lucros vêm de uma única plataforma.
            </div>
          </div>
        </div>
      )}

      {/* 19. CONSELHO ESTRATÉGICO */}
      {activeAba === "conselho-estrategico" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Conselho Estratégico do ToniMaluco C.I
          </h2>
          <p className="text-xs text-muted-foreground">Consulte os 7 conselheiros especialistas para analisar decisões de investimento e risco.</p>
          <Link to="/conselho" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110">
            <Users className="h-4 w-4" /> Ir para a Sala do Conselho →
          </Link>
        </div>
      )}

      {/* 20. RELATÓRIOS */}
      {activeAba === "relatorios" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Gerador de Relatórios Executivos (PDF / CSV)
          </h2>
          <p className="text-xs text-muted-foreground">Gere relatórios mensais completos formatados para envio ao contador ou análise da diretoria.</p>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110">
              Imprimir / Salvar PDF
            </button>
            <button onClick={() => toast.success("Relatório CSV exportado!")} className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground">
              Exportar Dados CSV
            </button>
          </div>
        </div>
      )}

      {/* 21. DIÁRIO DE DECISÕES */}
      {activeAba === "diario-decisoes" && (
        <div className="glass p-6 space-y-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> Diário de Decisões Estratégicas
          </h2>
          <div className="space-y-3 text-xs">
            {annotations.map((a) => (
              <div key={a.id} className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <span className="font-bold text-primary">{a.date}:</span> <span className="text-foreground">{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 22. CONFIGURAÇÕES DO NEGÓCIO */}
      {activeAba === "configuracoes" && (
        <div className="glass p-6 space-y-5 max-w-xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Configurações do Negócio
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-muted-foreground mb-1">Meta Mensal de Lucro Líquido (R$)</label>
              <input type="number" defaultValue="8000" className="w-full rounded-lg border border-input bg-background/50 p-2" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Margem Líquida Mínima Aceitável (%)</label>
              <input type="number" defaultValue="15" className="w-full rounded-lg border border-input bg-background/50 p-2" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Custos Fixos Mensais (R$)</label>
              <input type="number" defaultValue="890" className="w-full rounded-lg border border-input bg-background/50 p-2" />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Regime Tributário Estimado (%)</label>
              <input type="number" defaultValue="6" className="w-full rounded-lg border border-input bg-background/50 p-2" />
            </div>
            <button onClick={() => toast.success("Configurações do negócio salvas com sucesso!")} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:brightness-110">
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {/* Modal Lançar Dados */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-sm p-4">
          <div className="glass max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold">Lançar Nova Transação / Despesa</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Tipo de Lançamento</label>
                <select className="w-full rounded-lg border border-input bg-background/60 p-2">
                  <option>Venda de Produto</option>
                  <option>Compra de Estoque</option>
                  <option>Reembolso / Disputa</option>
                  <option>Despesa Fixa / Ferramenta</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Valor (R$)</label>
                <input type="number" placeholder="42.00" className="w-full rounded-lg border border-input bg-background/60 p-2" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowDataModal(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs">Cancelar</button>
              <button onClick={() => { setShowDataModal(false); toast.success("Lançamento salvo!"); }} className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground font-medium">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Legal & Financial Disclaimer */}
      <p className="text-[11px] text-muted-foreground text-center border-t border-border/30 pt-4">
        ⚠️ Análises são estimativas para apoio à decisão, não garantia de resultado nem aconselhamento financeiro, contábil ou jurídico. Validar parâmetros fiscais com contador.
      </p>
    </div>
  );
}

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  note: string;
  category: "Lancamento" | "Sazonalidade" | "Reposicao" | "Promocao" | "Meta";
}

const defaultCalendarEvents: CalendarEvent[] = [
  { id: "e1", date: "2026-10-15", title: "Lançamento Passe Valorant", note: "Aumentar estoque em +40%", category: "Lancamento" },
  { id: "e2", date: "2026-11-01", title: "Preparativo Black Friday", note: "Negociar lote com fornecedor GlobalKeys", category: "Sazonalidade" },
  { id: "e3", date: "2026-10-25", title: "Fechamento Trimestral Metas", note: "Revisão de margem com o conselho", category: "Meta" },
  { id: "e4", date: "2026-11-27", title: "Black Friday Oficial", note: "Desconto agressivo em VP e FC Points", category: "Promocao" },
  { id: "e5", date: "2026-12-20", title: "Promoção de Natal PSN / Xbox", note: "Foco em Gift Cards de R$50 e R$100", category: "Sazonalidade" },
];

function CalendarioSection() {
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 9, 10));
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("gestao_calendar_events_v2");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return defaultCalendarEvents;
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>("2026-10-15");
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState<{ title: string; note: string; category: CalendarEvent["category"] }>({
    title: "",
    note: "",
    category: "Lancamento",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("gestao_calendar_events_v2", JSON.stringify(events));
    }
  }, [events]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date(2026, 9, 10));

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const gridCells = useMemo(() => {
    const cells: Array<{ day: number; isCurrentMonth: boolean; dateStr: string }> = [];

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const pDay = totalDaysInPrevMonth - i;
      const pMonth = month === 0 ? 11 : month - 1;
      const pYear = month === 0 ? year - 1 : year;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, "0")}-${String(pDay).padStart(2, "0")}`;
      cells.push({ day: pDay, isCurrentMonth: false, dateStr });
    }

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, isCurrentMonth: true, dateStr });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nMonth = month === 11 ? 0 : month + 1;
      const nYear = month === 11 ? year + 1 : year;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
      cells.push({ day: n, isCurrentMonth: false, dateStr });
    }

    return cells;
  }, [year, month, firstDayOfWeek, totalDaysInMonth, totalDaysInPrevMonth]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !selectedDateStr) return;
    const created: CalendarEvent = {
      id: Math.random().toString(36).substring(2, 9),
      date: selectedDateStr,
      title: newEvent.title.trim(),
      note: newEvent.note.trim(),
      category: newEvent.category,
    };
    setEvents((prev) => [...prev, created]);
    setNewEvent({ title: "", note: "", category: "Lancamento" });
    setShowEventModal(false);
    toast.success("Evento estratégico adicionado ao calendário!");
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    toast.success("Evento removido.");
  };

  const selectedDayEvents = events.filter((ev) => ev.date === selectedDateStr);
  const todayStr = "2026-10-10";

  return (
    <div className="glass p-6 space-y-6">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Calendário Estratégico de Sazonalidade
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Planejamento de lançamentos, estoque, promoções e sazonalidade da operação digital.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button onClick={prevMonth} className="p-2 rounded-lg border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-display text-sm font-bold w-36 text-center text-foreground">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-2 rounded-lg border border-border/60 bg-background/50 text-muted-foreground hover:text-foreground hover:border-primary/40 transition">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={goToToday} className="px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition">
            Hoje
          </button>
        </div>
      </div>

      {/* Main Grid & Sidebar details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Calendar Grid (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-2">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground uppercase py-1 border-b border-border/30">
            {dayNames.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {gridCells.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDateStr;
              const dayEvents = events.filter((ev) => ev.date === cell.dateStr);
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[72px] p-1.5 rounded-lg border text-left transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? "border-primary bg-primary/15 shadow-md shadow-primary/10 glow"
                      : isToday
                      ? "border-emerald-500/60 bg-emerald-500/10"
                      : cell.isCurrentMonth
                      ? "border-border/40 bg-background/30 hover:border-primary/40 hover:bg-accent/30"
                      : "border-border/20 bg-background/10 text-muted-foreground/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`num text-xs font-bold ${
                      isToday ? "text-emerald-400" : isSelected ? "text-primary" : cell.isCurrentMonth ? "text-foreground" : "text-muted-foreground/40"
                    }`}>
                      {cell.day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-500/20 px-1 rounded">Hoje</span>
                    )}
                  </div>

                  {/* Event indicators */}
                  {hasEvents && (
                    <div className="space-y-0.5 mt-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`truncate text-[9px] px-1 py-0.5 rounded font-medium ${
                            ev.category === "Lancamento"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : ev.category === "Sazonalidade"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : ev.category === "Promocao"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[8px] text-muted-foreground pl-1">+{dayEvents.length - 2} mais</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details & Strategic Event Manager */}
        <div className="glass p-4 rounded-xl space-y-4 border border-border/50">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Eventos da Data</p>
              <h3 className="font-bold text-sm text-foreground">
                {selectedDateStr ? new Date(selectedDateStr + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "Selecione um dia"}
              </h3>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>

          {/* List of events for selected day */}
          <div className="space-y-3 min-h-[160px]">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40 text-primary" />
                Nenhum evento registrado nesta data. Clique em <strong>Adicionar</strong> para agendar lançamentos, estoque ou promoções.
              </div>
            ) : (
              selectedDayEvents.map((ev) => (
                <div key={ev.id} className="p-3 rounded-lg border border-border/60 bg-background/40 space-y-1 relative group">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                      ev.category === "Lancamento"
                        ? "bg-primary/20 text-primary"
                        : ev.category === "Sazonalidade"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : ev.category === "Promocao"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {ev.category}
                    </span>
                    <button onClick={() => handleDeleteEvent(ev.id)} title="Excluir evento" className="p-1 text-muted-foreground hover:text-rose-400 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="font-bold text-xs text-foreground mt-1">{ev.title}</p>
                  {ev.note && <p className="text-[11px] text-muted-foreground">{ev.note}</p>}
                </div>
              ))
            )}
          </div>

          {/* Agenda de Sazonalidade dos Próximos Meses */}
          <div className="border-t border-border/40 pt-3 space-y-2">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Radar de Sazonalidades Próximas</p>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded border border-border/40 bg-background/20 flex justify-between items-center">
                <span>🔥 15/10 — Passe Valorant</span>
                <span className="text-[10px] text-primary font-semibold">+40% estoque</span>
              </div>
              <div className="p-2 rounded border border-border/40 bg-background/20 flex justify-between items-center">
                <span>🛍️ 27/11 — Black Friday</span>
                <span className="text-[10px] text-rose-400 font-semibold">Promoção</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal to add new event */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass max-w-md w-full p-6 space-y-4 rounded-xl border border-primary/40 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-bold text-foreground">Novo Evento Estratégico</h3>
              <button onClick={() => setShowEventModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Data do Evento</label>
                <input
                  type="date"
                  required
                  value={selectedDateStr || todayStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Título do Evento / Marco</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lançamento Coleção Passe CS2"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Categoria do Evento</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as CalendarEvent["category"] })}
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                >
                  <option value="Lancamento">Lançamento de Jogo / Passe</option>
                  <option value="Sazonalidade">Sazonalidade (Datas Festivas)</option>
                  <option value="Reposicao">Reposição de Estoque</option>
                  <option value="Promocao">Promoção / Desconto</option>
                  <option value="Meta">Meta / Revisão de Caixa</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Ação Sugerida / Observação</label>
                <input
                  type="text"
                  placeholder="Ex: Aumentar limite de compra com fornecedor"
                  value={newEvent.note}
                  onChange={(e) => setNewEvent({ ...newEvent, note: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
                <button type="button" onClick={() => setShowEventModal(false)} className="rounded-lg border border-border px-4 py-2 text-muted-foreground hover:bg-accent">
                  Cancelar
                </button>
                <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:brightness-110">
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProChartSuite({ periodData }: { periodData: any }) {
  const [chartType, setChartType] = useState<"area" | "bar" | "line">("area");
  const [showReceita, setShowReceita] = useState(true);
  const [showLucro, setShowLucro] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);

  const [pieMode, setPieMode] = useState<"donut" | "pie">("donut");
  const [selectedSlice, setSelectedSlice] = useState<any | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const renderMainChart = () => {
    const data = periodData.revenueOverTime;

    if (chartType === "bar") {
      return (
        <BarChart data={data} onClick={(e) => e && e.activePayload && setSelectedPoint(e.activePayload[0].payload)}>
          <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={glassTip} formatter={(v: number) => brl(v)} />
          <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
          {showReceita && <Bar dataKey="receita" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Receita Bruta" />}
          {showLucro && <Bar dataKey="lucro" fill="var(--invest)" radius={[4, 4, 0, 0]} name="Lucro Líquido" />}
        </BarChart>
      );
    }

    if (chartType === "line") {
      return (
        <ComposedChart data={data} onClick={(e) => e && e.activePayload && setSelectedPoint(e.activePayload[0].payload)}>
          <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={glassTip} formatter={(v: number) => brl(v)} />
          <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
          {showReceita && <Line type="monotone" dataKey="receita" stroke="var(--primary)" strokeWidth={2.5} dot={showDots} name="Receita Bruta" />}
          {showLucro && <Line type="monotone" dataKey="lucro" stroke="var(--invest)" strokeWidth={2.5} dot={showDots} name="Lucro Líquido" />}
        </ComposedChart>
      );
    }

    return (
      <AreaChart data={data} onClick={(e) => e && e.activePayload && setSelectedPoint(e.activePayload[0].payload)}>
        <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={glassTip} formatter={(v: number) => brl(v)} />
        <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
        {showReceita && <Area type="monotone" dataKey="receita" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} dot={showDots} name="Receita Bruta" />}
        {showLucro && <Area type="monotone" dataKey="lucro" stroke="var(--invest)" fill="var(--invest)" fillOpacity={0.4} dot={showDots} name="Lucro Líquido" />}
      </AreaChart>
    );
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-xl p-6 overflow-y-auto" : ""}`}>
      {isFullscreen && (
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Modo Interativo Completo - Dashboard Financeiro Pro
          </h2>
          <button onClick={() => setIsFullscreen(false)} className="rounded-lg bg-accent p-2 hover:bg-accent/80">
            <Minimize2 className="h-5 w-5 text-foreground" />
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Main Revenue vs Profit Interactive Chart */}
        <div className="glass p-4 space-y-3 relative">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                Receita x Lucro Líquido ({periodData.label})
              </h3>
              <p className="text-[10px] text-muted-foreground">Clique em qualquer ponto do gráfico para inspecionar os detalhes.</p>
            </div>
            
            {/* Interactive Toolbars */}
            <div className="flex items-center gap-1.5 bg-background/50 p-1 rounded-lg border border-border/40">
              {/* Type Switcher */}
              <button 
                onClick={() => setChartType("area")} 
                title="Visão Área"
                className={`p-1 rounded text-xs transition-colors ${chartType === "area" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
              >
                Área
              </button>
              <button 
                onClick={() => setChartType("bar")} 
                title="Visão Barras"
                className={`p-1 rounded text-xs transition-colors ${chartType === "bar" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
              >
                Barras
              </button>
              <button 
                onClick={() => setChartType("line")} 
                title="Visão Linha"
                className={`p-1 rounded text-xs transition-colors ${chartType === "line" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
              >
                Linha
              </button>

              <div className="h-3 w-px bg-border/40 mx-0.5" />

              {/* Series Visibility Toggles */}
              <button
                onClick={() => setShowReceita(!showReceita)}
                title={showReceita ? "Ocultar Receita" : "Mostrar Receita"}
                className={`px-1.5 py-0.5 text-[10px] rounded flex items-center gap-1 ${showReceita ? "bg-primary/20 text-primary font-medium" : "text-muted-foreground line-through opacity-50"}`}
              >
                Receita
              </button>
              <button
                onClick={() => setShowLucro(!showLucro)}
                title={showLucro ? "Ocultar Lucro" : "Mostrar Lucro"}
                className={`px-1.5 py-0.5 text-[10px] rounded flex items-center gap-1 ${showLucro ? "bg-emerald-500/20 text-emerald-400 font-medium" : "text-muted-foreground line-through opacity-50"}`}
              >
                Lucro
              </button>

              <div className="h-3 w-px bg-border/40 mx-0.5" />

              {/* Dots Toggle */}
              <button
                onClick={() => setShowDots(!showDots)}
                title="Alternar Pontos de Marcação"
                className={`p-1 rounded text-xs ${showDots ? "text-primary" : "text-muted-foreground opacity-50"}`}
              >
                {showDots ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>

              <div className="h-3 w-px bg-border/40 mx-0.5" />

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title="Expandir Gráfico"
                className="p-1 rounded text-xs text-muted-foreground hover:text-foreground"
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            {renderMainChart()}
          </ResponsiveContainer>

          {/* Inspection Card on Click */}
          {selectedPoint && (
            <div className="mt-2 p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
              <div className="space-y-0.5">
                <span className="font-bold text-primary flex items-center gap-1">
                  📍 Ponto Inspecionado: {selectedPoint.date}
                </span>
                <div className="flex gap-4 text-muted-foreground">
                  <span>Receita: <strong className="text-foreground">{brl(selectedPoint.receita)}</strong></span>
                  <span>Lucro: <strong className="text-emerald-400">{brl(selectedPoint.lucro)}</strong></span>
                  <span>Margem: <strong className="text-amber-400">{selectedPoint.margem || ((selectedPoint.lucro / selectedPoint.receita) * 100).toFixed(1)}%</strong></span>
                </div>
              </div>
              <button onClick={() => setSelectedPoint(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Breakdown Donut / Pie Interactive Chart */}
        <div className="glass p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Composição do Faturamento ({periodData.label})</h3>
              <p className="text-[10px] text-muted-foreground">Clique na fatia para destacar e analisar.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/40">
                <button
                  onClick={() => setPieMode("donut")}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${pieMode === "donut" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
                >
                  Rosca
                </button>
                <button
                  onClick={() => setPieMode("pie")}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${pieMode === "pie" ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:bg-accent"}`}
                >
                  Pizza
                </button>
              </div>

              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">Fato registrado</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={periodData.compositionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={pieMode === "donut" ? 50 : 0}
                outerRadius={80}
                paddingAngle={pieMode === "donut" ? 4 : 0}
                onClick={(entry) => setSelectedSlice(entry)}
                className="cursor-pointer"
              >
                {periodData.compositionData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={selectedSlice?.name === entry.name ? "var(--primary)" : "none"}
                    strokeWidth={selectedSlice?.name === entry.name ? 3 : 0}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={glassTip} formatter={(v: number) => brl(v)} />
              <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>

          {/* Slice Inspection Card on Click */}
          {selectedSlice && (
            <div className="mt-2 p-3 rounded-lg bg-accent/60 border border-border flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ backgroundColor: selectedSlice.color }} />
                  Fatia Selecionada: {selectedSlice.name}
                </span>
                <div className="text-muted-foreground">
                  Valor Total: <strong className="text-foreground">{brl(selectedSlice.value)}</strong>
                </div>
              </div>
              <button onClick={() => setSelectedSlice(null)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
