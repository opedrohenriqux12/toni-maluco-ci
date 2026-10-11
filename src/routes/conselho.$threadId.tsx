import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swords, User, Users, Folder, FolderPlus, Save, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { advisors, route } from "@/lib/data";
import type { CouncilMode } from "@/lib/council-prompt";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { threadsKey } from "./conselho";
import { generateUUID } from "@/lib/uuid";
import { useCouncil } from "@/lib/councilContext";
import { useAuth } from "@/hooks/useAuth";
import { getProjects, saveOrUpdateSession, getSavedSessions, createProject, type ProjectFolder } from "@/lib/projectStore";

export const Route = createFileRoute("/conselho/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { user, loading: userLoading } = useAuth();

  // Load messages from Supabase if user exists, else from localStorage with auto-fallback
  const history = useQuery({
    queryKey: ["council-messages", threadId],
    queryFn: async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("council_messages")
            .select("sdk_id, role, parts")
            .eq("thread_id", threadId)
            .order("created_at", { ascending: true });
          if (!error && data) {
            return data.map((m) => ({ id: m.sdk_id, role: m.role as UIMessage["role"], parts: m.parts as UIMessage["parts"] }));
          }
        } catch (e) {
          console.warn("Supabase council_messages unavailable, falling back to local storage", e);
        }
      }

      // Fallback local robusto
      const stored = localStorage.getItem(`council_messages_${threadId}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
      return [];
    },
    enabled: !userLoading,
    staleTime: 5000,
  });

  if (history.isLoading) return <div className="glass grid min-h-[520px] place-items-center text-sm text-muted-foreground animate-pulse">Carregando conversa…</div>;

  return <ChatWindow key={threadId} threadId={threadId} user={user} initial={history.data ?? []} />;
}

function ChatWindow({ threadId, user, initial }: { threadId: string; user: any | null; initial: UIMessage[] }) {
  const qc = useQueryClient();
  const { mode, setMode, activeAdvisors } = useCouncil();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Projetos & Pastas
  const [projects, setProjects] = useState<ProjectFolder[]>(() => getProjects());
  const [selectedProject, setSelectedProject] = useState<string>(() => {
    const existing = getSavedSessions("conselho").find((s) => s.id === threadId);
    return existing?.projectId || "";
  });
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          if (user) {
            const { data } = await supabase.auth.getSession();
            return data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
          }
          return {};
        },
      }),
    [user],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (e) => toast.error(e.message || "Falha ao falar com o Conselho."),
    onFinish: async ({ message }) => {
      // Save assistant message
      if (user) {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const { error } = await supabase.from("council_messages").upsert(
          {
            thread_id: threadId,
            user_id: u.user.id,
            sdk_id: message.id,
            role: "assistant",
            parts: message.parts as any,
          },
          { onConflict: "thread_id,sdk_id" },
        );
        if (error) console.error("save assistant message", error);
      } else {
        // Save to localStorage
        const stored = localStorage.getItem(`council_messages_${threadId}`);
        const current: UIMessage[] = stored ? JSON.parse(stored) : [];
        const newMessage: UIMessage = {
          id: message.id,
          role: "assistant",
          parts: message.parts,
        };
        localStorage.setItem(`council_messages_${threadId}`, JSON.stringify([...current, newMessage]));
      }
      qc.invalidateQueries({ queryKey: threadsKey });
      inputRef.current?.focus();
    },
  });

  useEffect(() => inputRef.current?.focus(), []);

  const busy = status === "submitted" || status === "streaming";
  const preview = useMemo(() => route(text), [text]);
  const atQuery = /@(\p{L}*)$/u.exec(text)?.[1];
  const suggestions =
    atQuery !== undefined
      ? [{ id: "todos", short: "todos", area: "todos os ativos" }, ...advisors].filter((a) => a.short.toLowerCase().startsWith(atQuery.toLowerCase()))
      : [];

  const submit = async () => {
    if (!text.trim() || busy) return;
    const currentText = text;
    setText("");
    const userMessage: UIMessage = {
      id: generateUUID(),
      role: "user",
      parts: [{ type: "text", text: currentText }],
    };
    if (user) {
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("council_messages").upsert(
          {
            thread_id: threadId,
            user_id: u.user.id,
            sdk_id: userMessage.id,
            role: "user",
            parts: userMessage.parts as any,
          },
          { onConflict: "thread_id,sdk_id" },
        );
      }
    } else {
      const stored = localStorage.getItem(`council_messages_${threadId}`);
      const current: UIMessage[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(`council_messages_${threadId}`, JSON.stringify([...current, userMessage]));
    }
    sendMessage({ text: currentText }, { body: { threadId, mode, active: [...activeAdvisors] } });
    inputRef.current?.focus();
  };

  const handleSaveToProject = (projId?: string) => {
    setSelectedProject(projId || "");
    const title = messages[0]?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 50) || "Conversa do Conselho";
    saveOrUpdateSession({
      id: threadId,
      type: "conselho",
      title,
      projectId: projId || undefined,
      createdAt: new Date().toISOString(),
      data: messages,
    });
    toast.success(projId ? "Conversa associada ao Projeto com sucesso!" : "Conversa salva como Avulsa.");
  };

  const handleCreateProject = () => {
    if (!newProjName.trim()) return;
    const created = createProject(newProjName);
    setProjects(getProjects());
    handleSaveToProject(created.id);
    setNewProjName("");
    setShowNewProjModal(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de Modos + Seleção de Projeto/Pasta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Modos: Sala Geral, Individual, War Room */}
        <div className="flex flex-wrap items-center gap-2">
          {([["geral", "Sala geral", Users], ["individual", "Individual", User], ["war", "War Room", Swords]] as const).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                mode === id
                  ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-card/40"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {/* Pasta / Projeto da Conversa */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-card/60 border border-border/60 rounded-xl px-2.5 py-1 text-xs">
            <Folder className="h-3.5 w-3.5 text-primary" />
            <select
              value={selectedProject}
              onChange={(e) => handleSaveToProject(e.target.value)}
              className="bg-transparent text-xs text-foreground outline-none font-medium cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-zinc-300">Sem pasta (Avulsa)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-300">
                  📁 {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowNewProjModal(true)}
            className="p-1.5 rounded-lg border border-border bg-card/40 text-muted-foreground hover:text-foreground transition"
            title="Criar nova pasta de projeto"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => handleSaveToProject(selectedProject)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-semibold transition"
            title="Salvar conversa"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>
      </div>

      {/* Modal Rápido de Criação de Projeto */}
      {showNewProjModal && (
        <div className="p-3 bg-zinc-900/95 border border-primary/40 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 flex-1">
            <FolderPlus className="h-4 w-4 text-primary shrink-0" />
            <input
              type="text"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              placeholder="Nome da nova pasta de projeto (ex: Operação GGMAX)..."
              className="bg-zinc-800 px-3 py-1.5 rounded-lg text-foreground outline-none flex-1 font-mono text-xs border border-zinc-700"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateProject}
              className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 transition"
            >
              Criar e Salvar
            </button>
            <button
              onClick={() => setShowNewProjModal(false)}
              className="px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="glass flex h-[600px] flex-col">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 && (
              <div className="grid h-[420px] place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <p className="font-display text-lg text-foreground">O que vamos analisar hoje?</p>
                  <p className="mt-1">Ex.: "Vale colocar R$2 mil em FC Points antes do TOTY?" ou "@Rafael a GGMAX permite revenda de contas?"</p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "assistant" ? <MessageResponse key={i}>{p.text}</MessageResponse> : <p key={i} className="whitespace-pre-wrap">{p.text}</p>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && <Shimmer className="text-sm">O Conselho está pensando…</Shimmer>}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="relative border-t border-border p-3">
          {suggestions.length > 0 && (
            <div className="glass absolute bottom-full left-3 z-10 mb-2 w-64 p-1">
              {suggestions.map((s) => (
                <button key={s.id} type="button" onClick={() => { setText((t) => t.replace(/@(\p{L}*)$/u, `@${s.short} `)); inputRef.current?.focus(); }} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
                  @{s.short} <span className="text-[11px] text-muted-foreground">{s.area}</span>
                </button>
              ))}
            </div>
          )}
          {preview.ids.length > 0 && <p className="num mb-2 text-[11px] text-primary">Roteador: {preview.reason}</p>}
          <PromptInput onSubmit={submit}>
            <PromptInputTextarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Traga um desafio. Use @ para chamar um conselheiro."
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim()} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}