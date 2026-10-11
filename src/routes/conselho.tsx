import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
  import { useQuery, useQueryClient } from "@tanstack/react-query";
  import { useEffect, useState } from "react";
  import { LogOut, MessageSquarePlus, Trash2 } from "lucide-react";
  import { toast } from "sonner";
  import { PageTitle } from "@/components/AppShell";
  import { supabase } from "@/integrations/supabase/client";
  import { useAuth } from "@/hooks/useAuth";
  import { advisors } from "@/lib/data";
  import { generateUUID } from "@/lib/uuid";

import { CouncilProvider, useCouncil } from "@/lib/councilContext";
import { getProjects, getSavedSessions, type ProjectFolder, type SavedSession } from "@/lib/projectStore";

export const Route = createFileRoute("/conselho")({
  head: () => ({
    meta: [
      { title: "Conselho — ToniMaluco C.I" },
      { name: "description", content: "Escritório virtual com sete conselheiros especialistas que analisam e discordam de você." },
      { property: "og:title", content: "Conselho — ToniMaluco C.I" },
      { property: "og:description", content: "Escritório virtual com sete conselheiros especialistas que analisam e discordam de você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <CouncilProvider>
      <ConsiglioLayout />
    </CouncilProvider>
  ),
});

export const threadsKey = ["council-threads"] as const;

function ConsiglioLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { activeAdvisors, toggleAdvisor, mode } = useCouncil();
  const [localThreads, setLocalThreads] = useState<Array<{ id: string; title: string; updated_at: string; projectId?: string | undefined }>>([]);
  const [projects, setProjects] = useState<ProjectFolder[]>(() => getProjects());
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string | null>(null);

  // Carrega threads do localStorage / projectStore
  const loadStoredThreads = () => {
    setProjects(getProjects());
    const saved = getSavedSessions("conselho");
    const stored = localStorage.getItem("council_threads");
    let baseList: Array<{ id: string; title: string; updated_at: string; projectId?: string }> = [];

    if (stored) {
      try {
        baseList = JSON.parse(stored);
      } catch {}
    }

    // Merge com saved sessions para pegar os projectIds corretos
    const merged = baseList.map((t) => {
      const match = saved.find((s) => s.id === t.id);
      return match ? { ...t, projectId: match.projectId } : t;
    });

    setLocalThreads(merged);
  };

  useEffect(() => {
    loadStoredThreads();
  }, [user]);

  // Save threads to localStorage when they change (if no user)
  useEffect(() => {
    if (!user) {
      localStorage.setItem("council_threads", JSON.stringify(localThreads));
    }
  }, [localThreads, user]);

  const threadsQuery = useQuery({
    queryKey: threadsKey,
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("council_threads").select("id, title, updated_at").order("updated_at", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.warn("Supabase threads fetch error", e);
      }
      return localThreads;
    },
  });

  const allThreads = user ? (threadsQuery.data ?? localThreads) : localThreads;
  const filteredThreads = selectedFolderFilter === null
    ? allThreads
    : selectedFolderFilter === "avulso"
      ? allThreads.filter((t: any) => !t.projectId)
      : allThreads.filter((t: any) => t.projectId === selectedFolderFilter);

  const newThread = async () => {
    try {
      if (user) {
        // Create thread via Supabase
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) throw new Error("Sem sessão");
        const { data, error } = await supabase.from("council_threads").insert({ user_id: u.user.id }).select("id").single();
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: threadsKey });
        navigate({ to: "/conselho/$threadId", params: { threadId: data.id } });
      } else {
        // Create thread locally
        const newId = generateUUID();
        const newThread = { id: newId, title: "Nova conversa", updated_at: new Date().toISOString() };
        setLocalThreads((prev) => [newThread, ...prev]);
        navigate({ to: `/conselho/$threadId`, params: { threadId: newId } });
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível criar a conversa.");
    }
  };

  const remove = async (id: string) => {
    try {
      if (user) {
        const { error } = await supabase.from("council_threads").delete().eq("id", id);
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: threadsKey });
        navigate({ to: "/conselho" });
      } else {
        setLocalThreads((prev) => prev.filter((t) => t.id !== id));
        navigate({ to: "/conselho" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível apagar.");
    }
  };


  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle kicker="Conselho" title="O escritório está aberto.">
        Você conduz. O roteador escolhe quem é mais qualificado para responder; use @ para chamar alguém direto.
      </PageTitle>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="glass flex flex-col p-3 lg:max-h-[720px] overflow-y-auto">
          <p className="num mb-3 px-1 text-[11px] uppercase tracking-widest text-muted-foreground">No Escritório</p>
          <div className="mb-4 space-y-2">
            {advisors.map((a) => {
              const isActive = activeAdvisors.has(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAdvisor(a.id)}
                  className={`flex w-full text-left items-start gap-3 rounded-lg border p-2 transition-all ${
                    isActive
                      ? "border-primary/60 bg-primary/10 glow ring-1 ring-primary/40 text-foreground"
                      : "border-border/30 bg-background/20 opacity-50 hover:opacity-80 hover:bg-accent/30"
                  }`}
                >
                  <div className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border font-display text-xs font-bold transition ${
                    isActive ? "border-primary bg-secondary text-primary" : "border-border bg-muted text-muted-foreground"
                  }`}>
                    {a.initials}
                    <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-background ${isActive ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug">{a.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight">{a.area} · <span className="opacity-80">{a.persona}</span></p>
                  </div>
                </button>
              );
            })}
          </div>

          <button onClick={newThread} className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110">
            <MessageSquarePlus className="h-4 w-4" /> Nova conversa
          </button>

          {/* Filtro por Pastas / Projetos */}
          <div className="mb-2">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Projetos & Pastas</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              <button
                onClick={() => setSelectedFolderFilter(null)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  selectedFolderFilter === null
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos ({allThreads.length})
              </button>
              {projects.map((p) => {
                const count = allThreads.filter((t: any) => t.projectId === p.id).length;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedFolderFilter(p.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                      selectedFolderFilter === p.id
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    📁 {p.name} ({count})
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedFolderFilter("avulso")}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  selectedFolderFilter === "avulso"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                Avulsas ({allThreads.filter((t: any) => !t.projectId).length})
              </button>
            </div>
          </div>

          <p className="num mb-2 px-1 text-[11px] uppercase tracking-widest text-muted-foreground">Conversas Registradas</p>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {filteredThreads.length === 0 && (
              <p className="px-1 text-xs text-muted-foreground italic">Nenhuma conversa encontrada nesta pasta.</p>
            )}
            {filteredThreads.map((t: any) => {
              const matchedProj = projects.find((p) => p.id === t.projectId);
              return (
                <div key={t.id} className="group flex items-center justify-between rounded-lg hover:bg-accent px-1.5 py-1">
                  <Link
                    to="/conselho/$threadId"
                    params={{ threadId: t.id }}
                    className="min-w-0 flex-1 truncate text-xs text-muted-foreground"
                    activeProps={{ className: "text-primary font-semibold" }}
                  >
                    <div className="truncate font-medium">{t.title}</div>
                    {matchedProj && (
                      <span className="text-[10px] text-primary/80 font-mono">
                        📁 {matchedProj.name}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => remove(t.id)}
                    aria-label="Apagar conversa"
                    className="p-1 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="mt-3 flex items-center gap-2 px-1 text-xs text-muted-foreground hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" /> Sair ({user.email})
            </button>
          )}
        </div>
        <Outlet />
      </div>
    </div>
  );
}