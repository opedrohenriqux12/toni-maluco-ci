import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swords, User, Users } from "lucide-react";
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
  import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/conselho/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const { user, loading: userLoading } = useAuth();

  // Load messages from Supabase if user exists, else from localStorage
  const history = useQuery({
    queryKey: ["council-messages", threadId],
    queryFn: async () => {
      if (user) {
        const { data, error } = await supabase
          .from("council_messages")
          .select("sdk_id, role, parts")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return data.map((m) => ({ id: m.sdk_id, role: m.role as UIMessage["role"], parts: m.parts as UIMessage["parts"] }));
      } else {
        const stored = localStorage.getItem(`council_messages_${threadId}`);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            return [];
          }
        }
        return [];
      }
    },
    enabled: !userLoading, // Only run after we know the user status
    staleTime: Infinity,
    gcTime: 0,
  });

  if (history.isLoading) return <div className="glass grid min-h-[520px] place-items-center text-sm text-muted-foreground">Carregando conversa…</div>;
  if (history.error) return <div className="glass grid min-h-[520px] place-items-center text-sm text-destructive">Não foi possível carregar esta conversa.</div>;

  return <ChatWindow key={threadId} threadId={threadId} user={user} initial={history.data ?? []} />;
}

function ChatWindow({ threadId, user, initial }: { threadId: string; user: any | null; initial: UIMessage[] }) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<CouncilMode>("geral");
  const [active, setActive] = useState<Set<string>>(new Set(advisors.map((a) => a.id)));
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    sendMessage({ text: currentText }, { body: { threadId, mode, active: [...active] } });
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {([["geral", "Sala geral", Users], ["individual", "Individual", User], ["war", "War Room", Swords]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setMode(id)} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${mode === id ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

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