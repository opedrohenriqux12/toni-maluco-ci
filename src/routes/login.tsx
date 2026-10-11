import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/AppShell";
import { Eye, EyeOff, ShieldCheck, KeyRound, Lock, Mail, AlertTriangle, ArrowRight } from "lucide-react";

const safe = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/conselho");

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof s["redirect"] === "string" ? (s["redirect"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Acesso Seguro — ToniMaluco C.I" },
      { name: "description", content: "Autenticação corporativa com criptografia de ponta a ponta e defesa em camadas." },
      { property: "og:title", content: "Acesso Seguro — ToniMaluco C.I" },
    ],
  }),
  component: Login,
});

export function Login() {
  const { redirect } = Route.useSearch();
  const target = safe(redirect);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState<"in" | "up" | "mfa" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleResendConfirmation = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Informe seu e-mail para reenviar a confirmação.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
      });
      if (error) throw error;
      toast.success("Novo e-mail de ativação enviado! Verifique sua caixa de entrada e pasta de Spam.");
    } catch (err: any) {
      toast.error(err.message || "Não foi possível reenviar o e-mail no momento.");
    } finally {
      setBusy(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("tonimaluco_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true);
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && mode !== "mfa") {
      navigate({ to: target });
    }
  }, [user, target, navigate, mode]);

  // Client-side password strength validation (Defense in Depth)
  const passwordCriteria = {
    length: password.length >= 12,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).filter(Boolean).length >= 4 && passwordCriteria.length;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    const cleanEmail = email.trim().toLowerCase();
    // Save or clear remembered email
    if (typeof window !== "undefined") {
      if (rememberEmail && cleanEmail) {
        localStorage.setItem("tonimaluco_remembered_email", cleanEmail);
      } else {
        localStorage.removeItem("tonimaluco_remembered_email");
      }
    }

    try {
      if (mode === "in") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          const errLower = error.message.toLowerCase();
          if (errLower.includes("email not confirmed")) {
            setNeedsEmailConfirmation(true);
            throw new Error("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e spam, ou clique abaixo para reenviar a ativação.");
          }
          if (errLower.includes("invalid login credentials")) {
            throw new Error("E-mail ou senha incorretos.");
          }
          throw new Error(error.message || "Erro ao realizar login.");
        }

        // Check if MFA TOTP is required (AAL2 verification)
        const { data: mfaData, error: mfaCheckError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (!mfaCheckError && mfaData && mfaData.nextLevel === "aal2" && mfaData.currentLevel !== "aal2") {
          setMode("mfa");
          toast.info("Autenticação em Dois Fatores (MFA) necessária.");
          return;
        }

        toast.success("Acesso autorizado com sucesso!");
        navigate({ to: target });
      } else if (mode === "up") {
        if (!isPasswordStrong) {
          toast.error("A senha deve ter no mínimo 12 caracteres e atender aos requisitos de segurança.");
          setBusy(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${target}`,
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("user already registered")) {
            throw new Error("Este e-mail já está cadastrado. Alterne para o modo 'Fazer login' ou use 'Esqueceu a senha?'.");
          }
          throw new Error(error.message || "Não foi possível processar o cadastro.");
        }

        if (!data.session) {
          setNeedsEmailConfirmation(true);
          toast.info("Cadastro realizado! O Supabase enviou um link de ativação para seu e-mail. Confirme-o para liberar o acesso.", { duration: 10000 });
          setMode("in");
        } else {
          toast.success("Conta criada e verificada com sucesso!");
          navigate({ to: target });
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(target)}`,
        });

        if (error) {
          throw new Error(error.message || "Erro ao processar solicitação.");
        }

        toast.success("Se o e-mail estiver cadastrado, um link de recuperação foi enviado.");
        setMode("in");
      }
    } catch (err: any) {
      toast.error(err.message || "Credenciais inválidas ou erro de autenticação.");
    } finally {
      setBusy(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;

      const totpFactor = factors.data.totp[0];
      if (!totpFactor) {
        throw new Error("Fator TOTP não encontrado.");
      }

      const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.data.id,
        code: mfaCode.trim(),
      });

      if (verify.error) {
        throw new Error("Código MFA inválido ou expirado.");
      }

      toast.success("Segundo fator validado com sucesso!");
      navigate({ to: target });
    } catch (err: any) {
      toast.error(err.message || "Falha na validação do código MFA.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const r = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + target,
      });
      if (r.error) toast.error("Não foi possível autenticar com o Google.");
    } catch {
      toast.error("Erro no serviço de autenticação.");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <div className="glass p-7 rounded-2xl border border-border/60 shadow-2xl space-y-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Logo />
            <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Blindagem Ativa
            </span>
          </div>

        {/* Mode: MFA Verification Form */}
        {mode === "mfa" ? (
          <form onSubmit={handleMfaVerify} className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Autenticação em 2 Fatores
              </h2>
              <p className="text-xs text-muted-foreground">
                Insira o código de 6 dígitos gerado pelo seu aplicativo autenticador (Google Authenticator ou Authy).
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">Código de Segurança</label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="000000"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-lg border border-input bg-background/50 outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={busy || mfaCode.length !== 6}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-50 glow"
            >
              {busy ? "Validando..." : "Confirmar e Entrar"}
            </button>

            <button
              type="button"
              onClick={() => setMode("in")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Voltar ao login principal
            </button>
          </form>
        ) : mode === "forgot" ? (
          /* Mode: Forgot Password */
          <form onSubmit={handleAuthSubmit} className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Recuperação Segura</h2>
              <p className="text-xs text-muted-foreground">
                Informe seu e-mail cadastrado para receber instruções seguras de redefinição.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-muted-foreground">E-mail corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tonimaluco.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background/50 outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-50 glow"
            >
              {busy ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <button
              type="button"
              onClick={() => setMode("in")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Lembrou a senha? Voltar ao login
            </button>
          </form>
        ) : (
          /* Mode: Login ("in") or SignUp ("up") */
          <>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {mode === "in" ? "Acesso ao Painel" : "Cadastrar Operador"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {mode === "in"
                  ? "Entre com suas credenciais protegidas por RBAC e RLS."
                  : "Crie uma nova conta com política de senha de alta entropia."}
              </p>
            </div>

            {/* Google OAuth Provider */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-4 py-2 text-xs font-medium transition hover:bg-accent hover:border-primary/40 active:scale-98"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continuar com Google
            </button>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-border/40" />
              <span className="bg-card px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground absolute">
                ou e-mail seguro
              </span>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">E-mail corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-input bg-background/50 outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide toggle */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-muted-foreground">Senha</label>
                  {mode === "in" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-input bg-background/50 outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground p-0.5 rounded transition"
                    title={showPassword ? "Ocultar senha" : "Ver senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator (Sign-up Mode) */}
                {mode === "up" && (
                  <div className="p-2.5 rounded-lg bg-background/40 border border-border/40 text-[11px] space-y-1.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Força da senha:</span>
                      <span className={isPasswordStrong ? "text-emerald-400 font-bold" : "text-amber-400"}>
                        {isPasswordStrong ? "Forte" : "Requer 12+ caracteres"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                      <span className={passwordCriteria.length ? "text-emerald-400" : ""}>✓ Mínimo 12 caracteres</span>
                      <span className={passwordCriteria.hasUpper ? "text-emerald-400" : ""}>✓ Letra maiúscula</span>
                      <span className={passwordCriteria.hasNumber ? "text-emerald-400" : ""}>✓ Número</span>
                      <span className={passwordCriteria.hasSpecial ? "text-emerald-400" : ""}>✓ Símbolo especial</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Remember Email Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  Lembrar meu e-mail
                </label>
              </div>

              {/* Email Confirmation Alert Banner */}
              {needsEmailConfirmation && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <p className="font-semibold text-amber-200">Confirmação de e-mail pendente</p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                        O Supabase enviou um e-mail de ativação para <strong className="text-amber-100">{email || "seu endereço"}</strong>. Verifique sua caixa de entrada e a pasta de <strong>Spam / Lixo Eletrônico</strong> e clique no link para ativar sua conta.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={busy}
                    className="w-full text-center text-[11px] font-bold text-amber-300 underline hover:text-white transition pt-0.5 disabled:opacity-50"
                  >
                    Reenviar e-mail de ativação agora
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition disabled:opacity-60 glow"
              >
                {busy ? (
                  "Autenticando..."
                ) : mode === "in" ? (
                  <>Entrar no Painel <ArrowRight className="h-4 w-4" /></>
                ) : (
                  "Registrar Acesso"
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="pt-2 border-t border-border/40 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === "in" ? "up" : "in")}
                className="text-xs text-muted-foreground hover:text-primary transition"
              >
                {mode === "in" ? "Novo operador? Solicitar acesso" : "Já possui credenciais? Fazer login"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Security Footer Notice */}
      <div className="mt-4 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3 text-emerald-400" /> Sessões autenticadas utilizam criptografia e políticas RLS de negação padrão.
      </div>
      </div>
    </div>
  );
}

export default Login;
