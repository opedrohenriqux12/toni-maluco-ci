import { useState, useMemo } from "react";
import { TrendingEvent } from "@/lib/trendingStore";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, 
  Sparkles, Zap, Trash2, CheckCircle2, Clock, DollarSign, 
  Tag, Filter, ArrowUpRight, CalendarDays, ListOrdered, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Calendar60DaysSectionProps {
  events: TrendingEvent[];
  setEvents: (events: TrendingEvent[]) => void;
  onTransformToOpportunity: (event: TrendingEvent) => void;
}

export function Calendar60DaysSection({ 
  events, 
  setEvents, 
  onTransformToOpportunity 
}: Calendar60DaysSectionProps) {
  // Reference date: October 10, 2026
  const todayStr = "2026-10-10";
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = Outubro

  // Selected date in the calendar
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // View mode: 'grade' (Grid Mensal) or 'timeline' (Próximos 60 Dias)
  const [viewMode, setViewMode] = useState<"grade" | "timeline">("grade");

  // Filter Category
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // New Event Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(todayStr);
  const [newCategory, setNewCategory] = useState<TrendingEvent["category"]>("IA & Tech");
  const [newNotes, setNewNotes] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newMonetization, setNewMonetization] = useState<"Altíssimo" | "Alto" | "Médio">("Altíssimo");

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9); // Outubro
    setSelectedDate(todayStr);
  };

  // Calendar Grid Calculations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const days = [];

    // Empty slots before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ dayNumber: null, dateStr: null });
    }

    // Days of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthFormatted = String(currentMonth + 1).padStart(2, "0");
      const dayFormatted = String(day).padStart(2, "0");
      const dateStr = `${currentYear}-${monthFormatted}-${dayFormatted}`;
      days.push({ dayNumber: day, dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Map events by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, TrendingEvent[]> = {};
    events.forEach((ev) => {
      const existing = map[ev.startDate];
      if (existing) {
        existing.push(ev);
      } else {
        map[ev.startDate] = [ev];
      }
    });
    return map;
  }, [events]);

  // Selected Date Events
  const selectedDateEvents = useMemo(() => {
    return events.filter((ev) => ev.startDate === selectedDate);
  }, [events, selectedDate]);

  // 60-Day Window Events (from 2026-10-10 to 60 days ahead)
  const next60DaysEvents = useMemo(() => {
    const startDate = new Date(todayStr).getTime();
    const endDate = startDate + 60 * 24 * 60 * 60 * 1000;

    return events
      .filter((ev) => {
        const evDate = new Date(ev.startDate).getTime();
        const isInRange = evDate >= startDate && evDate <= endDate;
        const matchesCat = filterCategory === "all" || ev.category === filterCategory;
        return isInRange && matchesCat;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, filterCategory]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newEv: TrendingEvent = {
      id: "ev-" + Date.now(),
      title: newTitle.trim(),
      startDate: newDate,
      endDate: newDate,
      category: newCategory,
      notes: newNotes.trim() || undefined,
      opportunityAction: newAction.trim() || undefined,
      monetizationPotential: newMonetization,
      affectsMyProducts: true,
      reminderDaysBefore: 3
    };

    setEvents([...events, newEv]);
    toast.success("Evento e oportunidade cadastrados no calendário!");
    setShowAddModal(false);
    setNewTitle("");
    setNewNotes("");
    setNewAction("");
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    toast.info("Evento removido do calendário.");
  };

  // Helper for category badge color
  const getCategoryBadgeClass = (cat: TrendingEvent["category"]) => {
    switch (cat) {
      case "IA & Tech":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "Promocao":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "Lancamento":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "Torneio":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30";
      case "Sazonal":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  // Calculate days remaining from today
  const getDaysRemaining = (targetDateStr: string) => {
    const today = new Date(todayStr).getTime();
    const target = new Date(targetDateStr).getTime();
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    if (diffDays < 0) return `${Math.abs(diffDays)} dias atrás`;
    return `Em ${diffDays} dias`;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Navegação de Mês & Alternância de Visualização */}
      <div className="glass p-5 rounded-2xl border border-border/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">
              Calendário Estratégico & Mapa dos Próximos 60 Dias
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              60 Dias Mapeados
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Navegue pelos meses e dias, descubra oportunidades mapeadas com antecedência e prepare seus produtos para os picos de demanda.
          </p>
        </div>

        {/* View Toggle + New Event Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center rounded-xl border border-border bg-card/60 p-1 text-xs">
            <button
              onClick={() => setViewMode("grade")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === "grade"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Grade Mensal
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === "timeline"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" /> Linha do Tempo (60 Dias)
            </button>
          </div>

          <button
            onClick={() => {
              setNewDate(selectedDate || todayStr);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow glow"
          >
            <Plus className="h-4 w-4" /> Novo Evento
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: GRADE MENSAL INTERATIVA */}
      {viewMode === "grade" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Grid (2 cols on desktop) */}
          <div className="lg:col-span-2 glass p-5 rounded-2xl border border-border/60 space-y-4">
            {/* Month Navigation Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition"
                  title="Mês anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h4 className="font-bold text-sm text-foreground min-w-[140px] text-center">
                  {monthNames[currentMonth]} {currentYear}
                </h4>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition"
                  title="Próximo mês"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoToToday}
                  className="text-xs px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                >
                  Ir para Hoje (10/10)
                </button>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  {events.length} eventos no total
                </span>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground uppercase py-1">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => {
                if (!cell.dayNumber || !cell.dateStr) {
                  return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-card/10 opacity-30" />;
                }

                const isToday = cell.dateStr === todayStr;
                const isSelected = cell.dateStr === selectedDate;
                const dayEvents = eventsByDate[cell.dateStr] || [];
                const hasEvents = dayEvents.length > 0;

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr!)}
                    className={`h-20 p-1.5 rounded-xl text-left flex flex-col justify-between transition relative border ${
                      isSelected
                        ? "border-primary bg-primary/15 shadow-md glow"
                        : isToday
                        ? "border-amber-400/50 bg-amber-400/10"
                        : hasEvents
                        ? "border-border/60 bg-card/50 hover:border-primary/40"
                        : "border-border/30 bg-card/20 hover:bg-card/40"
                    }`}
                  >
                    {/* Day number & indicators */}
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-primary"
                            : isToday
                            ? "text-amber-300 font-extrabold"
                            : "text-foreground/80"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-extrabold text-amber-300 bg-amber-400/20 px-1 rounded">
                          HOJE
                        </span>
                      )}
                    </div>

                    {/* Events indicators inside cell */}
                    {hasEvents && (
                      <div className="space-y-0.5 w-full overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`truncate text-[9px] px-1 py-0.2 rounded font-medium border ${getCategoryBadgeClass(
                              ev.category
                            )}`}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[8px] text-muted-foreground font-semibold">
                            +{dayEvents.length - 2} mais
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Slide-over Panel (1 col on desktop) */}
          <div className="glass p-5 rounded-2xl border border-border/60 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  {selectedDate === todayStr ? "Hoje, " : ""}
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {getDaysRemaining(selectedDate)}
                </p>
              </div>

              <button
                onClick={() => {
                  setNewDate(selectedDate);
                  setShowAddModal(true);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-primary/20 text-primary font-bold hover:bg-primary/30 transition flex items-center gap-1"
                title="Cadastrar evento nesta data"
              >
                <Plus className="h-3 w-3" /> Evento
              </button>
            </div>

            {/* List of events on selected date */}
            <div className="space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-border/60 bg-accent/30 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(ev.category)}`}>
                        {ev.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {ev.monetizationPotential && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {ev.monetizationPotential}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-muted-foreground hover:text-rose-400 transition p-1"
                          title="Excluir evento"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-foreground text-xs">{ev.title}</h5>
                      {ev.notes && (
                        <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
                          {ev.notes}
                        </p>
                      )}
                    </div>

                    {/* Action Plan & Opportunity Button */}
                    {ev.opportunityAction && (
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground space-y-1">
                        <strong className="text-primary text-[10px] uppercase font-bold block">
                          💡 Oportunidade Estratégica:
                        </strong>
                        <p className="text-muted-foreground">{ev.opportunityAction}</p>
                      </div>
                    )}

                    <button
                      onClick={() => onTransformToOpportunity(ev)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow glow"
                    >
                      <Zap className="h-3.5 w-3.5" /> Aproveitar Oportunidade
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-2">
                  <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-semibold text-muted-foreground">Nenhum evento neste dia.</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Você pode cadastrar um lançamento ou promoção clicando no botão "+ Evento".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: LINHA DO TEMPO DOS PRÓXIMOS 60 DIAS */}
      {viewMode === "timeline" && (
        <div className="space-y-4">
          {/* Category Filter for 60-Day View */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "all", label: "Todos os 60 Dias" },
              { id: "IA & Tech", label: "IA & Tecnologia" },
              { id: "Promocao", label: "Promoções & Vendas" },
              { id: "Lancamento", label: "Lançamentos" },
              { id: "Torneio", label: "Torneios & Esports" },
              { id: "Sazonal", label: "Datas Sazonais" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 font-medium transition whitespace-nowrap ${
                  filterCategory === cat.id
                    ? "bg-primary text-primary-foreground font-bold shadow"
                    : "border border-border/60 bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Timeline Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {next60DaysEvents.map((ev) => (
              <div
                key={ev.id}
                className="glass p-4 rounded-2xl border border-border/60 hover:border-primary/40 transition flex flex-col justify-between space-y-3 relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryBadgeClass(ev.category)}`}>
                      {ev.category}
                    </span>
                    <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {getDaysRemaining(ev.startDate)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-muted-foreground font-mono block">
                      {new Date(ev.startDate + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short"
                      })}
                    </span>
                    <h5 className="font-bold text-foreground text-sm mt-0.5">{ev.title}</h5>
                    {ev.notes && (
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                        {ev.notes}
                      </p>
                    )}
                  </div>

                  {ev.opportunityAction && (
                    <div className="p-2.5 rounded-xl bg-accent/40 border border-border/50 text-[11px] space-y-1">
                      <strong className="text-primary text-[10px] uppercase font-bold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Ação Recomendada:
                      </strong>
                      <p className="text-muted-foreground leading-relaxed">{ev.opportunityAction}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                  <button
                    onClick={() => onTransformToOpportunity(ev)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition shadow glow"
                  >
                    <Zap className="h-3.5 w-3.5" /> Aproveitar Oportunidade
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-400 transition rounded-lg hover:bg-white/5"
                    title="Excluir"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {next60DaysEvents.length === 0 && (
            <div className="glass p-12 text-center rounded-2xl border border-border/60 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Nenhum evento neste filtro nos próximos 60 dias.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Adicionar Novo Evento */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateEvent}
            className="glass w-full max-w-md p-6 rounded-2xl border border-border/60 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" /> Novo Evento Estratégico
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Lançamento Passe Temporada Ep.11"
                  className="w-full rounded-lg border border-input bg-background/50 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                  >
                    <option value="IA & Tech">IA & Tecnologia</option>
                    <option value="Promocao">Promoção / Vendas</option>
                    <option value="Lancamento">Lançamento</option>
                    <option value="Torneio">Torneio / Esports</option>
                    <option value="Sazonal">Data Sazonal</option>
                    <option value="Patch">Patch / Atualização</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Descrição / Contexto</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="O que vai acontecer no mercado nesta data..."
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Oportunidade de Monetização (Ação)</label>
                <textarea
                  rows={2}
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="Qual produto ofertar ou qual ação tomar para lucrar..."
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Potencial de Lucro</label>
                <select
                  value={newMonetization}
                  onChange={(e) => setNewMonetization(e.target.value as any)}
                  className="w-full rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                >
                  <option value="Altíssimo">Altíssimo</option>
                  <option value="Alto">Alto</option>
                  <option value="Médio">Médio</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 glow"
              >
                Salvar Evento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
