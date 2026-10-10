import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/AppShell";

const safe = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/conselho");

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({ redirect: typeof s["redirect"] === "string" ? (s["redirect"] as string) : undefined }),
  head: () => ({
    meta: [
      { title: "Entrar — ToniMaluco C.I" },
      { name: "description", content: "Entre para salvar suas conversas com o Conselho." },
      { property: "og:title", content: "Entrar — ToniMaluco C.I" },
      { property: "og:description", content: "Entre para salvar suas conversas com o Conselho." },
    ],
  }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const target = safe(redirect);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: target });
  }, [user, target, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${target}` },
        });
        if (error) throw error;
        if (!data.session) toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + target });
    if (r.error) toast.error("Não foi possível entrar com Google.");
  };

  return (
    <div className="mx-auto mt-10 max-w-sm">
      <div className="glass p-6">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">{mode === "in" ? "Entrar" : "Criar conta"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suas conversas com o Conselho ficam salvas na sua conta.</p>
        <button onClick={google} className="mt-6 w-full rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-accent">
          Continuar com Google
        </button>
        <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full rounded-lg border border-input bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full rounded-lg border border-input bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          <button disabled={busy} className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60">
            {busy ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground">
          {mode === "in" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
