import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Lock, ShieldCheck, LogOut, KeyRound, CheckCircle2, 
  AlertTriangle, Mail, ShieldAlert, Smartphone, Clock, Trash2
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil & Segurança — ToniMaluco C.I" },
      { name: "description", content: "Gerenciamento da conta de operador, alteração de senha segura e controle de sessão." },
    ],
  }),
  component: PerfilPage,
});

export function PerfilPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaEnrolling, setMfaEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState("");

  const [activeFactors, setActiveFactors] = useState<any[]>([]);

  const loadFactors = async () => {
    try {
      const res = await supabase.auth.mfa.listFactors();
      if (res.data?.totp) {
        setActiveFactors(res.data.totp);
      } else {
        setActiveFactors([]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      loadFactors();
    }
  }, [user]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12) {
      toast.error("A nova senha deve ter no mínimo 12 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar senha.");
    } finally {
      setBusy(false);
    }
  };

  const handleStartMfaEnroll = async () => {
    setMfaEnrolling(true);
    try {
      // Clean up previous unverified factors so Supabase doesn't block enrollment
      const factorsRes = await supabase.auth.mfa.listFactors();
      if (factorsRes.data?.totp) {
        for (const factor of factorsRes.data.totp) {
          if ((factor as any).status === "unverified") {
            await supabase.auth.mfa.unenroll({ factorId: factor.id });
          }
        }
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "ToniMaluco C.I",
        friendlyName: user?.email || "Operador",
      });

      if (error) throw error;
      if (data) {
        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setMfaSecret(data.totp.secret);
      }
    } catch (err: any) {
      toast.error(err.message || "Não foi possível iniciar o cadastro de MFA.");
      setMfaEnrolling(false);
    }
  };

  const handleConfirmMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || totpVerifyCode.length !== 6) return;

    setBusy(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: totpVerifyCode.trim(),
      });

      if (error) throw error;

      toast.success("MFA TOTP ativado com sucesso para sua conta!");
      setMfaEnrolling(false);
      setQrCode(null);
      setTotpVerifyCode("");
      loadFactors();
    } catch (err: any) {
      toast.error(err.message || "Código inválido ou expirado.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnenrollMfa = async (id: string) => {
    if (!confirm("Deseja realmente desativar a autenticação em 2 fatores para esta conta?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (error) throw error;
      toast.success("Autenticação em 2 fatores desativada com sucesso.");
      loadFactors();
    } catch (err: any) {
      toast.error(err.message || "Erro ao desativar autenticador.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sessão encerrada.");
      navigate({ to: "/login" });
    } catch {
      toast.error("Erro ao deslogar.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageTitle kicker="CONTA & SEGURANÇA" title="Meu Perfil de Operador">
        Gerencie suas credenciais de acesso, ative o duplo fator e encerre sessões.
      </PageTitle>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Card do Usuário */}
        <div className="glass p-6 rounded-2xl border border-border/60 space-y-4 md:col-span-1 h-fit">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-lg">
              <User className="h-6 w-6" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-foreground truncate">{user?.email?.split("@")[0] || "Operador"}</h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
                Sessão Ativa
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-border/40 pt-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span className="truncate">{user?.email || "Sem e-mail"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Papel: <strong>Admin / Operador</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Criado em: {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "Recente"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border/40">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive/15 border border-destructive/30 py-2.5 text-xs font-bold text-rose-400 hover:bg-destructive/25 transition"
            >
              <LogOut className="h-4 w-4" /> Encerrar Sessão
            </button>
          </div>
        </div>

        {/* Formulários de Alteração de Senha & MFA */}
        <div className="space-y-6 md:col-span-2">
          {/* Alterar Senha */}
          <div className="glass p-6 rounded-2xl border border-border/60 space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
              <Lock className="h-4 w-4 text-primary" /> Alterar Senha de Acesso
            </h3>
            <p className="text-xs text-muted-foreground">
              A nova senha deve possuir pelo menos 12 caracteres, incluindo maiúsculas, números e símbolos especiais.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Nova Senha</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 12 caracteres..."
                  className="w-full rounded-lg border border-input bg-background/50 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha..."
                  className="w-full rounded-lg border border-input bg-background/50 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-50 glow"
                >
                  {busy ? "Atualizando..." : "Salvar Nova Senha"}
                </button>
              </div>
            </form>
          </div>

          {/* Autenticação em Dois Fatores (MFA TOTP) */}
          <div className="glass p-6 rounded-2xl border border-border/60 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                  <Smartphone className="h-4 w-4 text-emerald-400" /> Autenticação em Dois Fatores (MFA / 2FA)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Proteja sua conta contra invasões exigindo um código de 6 dígitos do Google Authenticator ou Authy.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                AAL2 Suportado
              </span>
            </div>

            {/* Status of Active Verified Factors */}
            {activeFactors.some((f) => f.status === "verified") ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-foreground">Autenticação em 2 Fatores Ativa</p>
                      <p className="text-[11px] text-muted-foreground">Sua conta está protegida com autenticador TOTP.</p>
                    </div>
                  </div>
                  {activeFactors
                    .filter((f) => f.status === "verified")
                    .map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleUnenrollMfa(f.id)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Desativar 2FA
                      </button>
                    ))}
                </div>
              </div>
            ) : !mfaEnrolling ? (
              <button
                onClick={handleStartMfaEnroll}
                disabled={busy}
                className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition disabled:opacity-50"
              >
                Configurar Autenticador TOTP
              </button>
            ) : (
              <form onSubmit={handleConfirmMfa} className="space-y-4 pt-2 border-t border-border/40 text-xs">
                {qrCode && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-accent/40 border border-border">
                    <img src={qrCode} alt="QR Code MFA" className="h-36 w-36 rounded-lg bg-white p-2" />
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Escaneie o QR Code no seu aplicativo autenticador.</p>
                      <p className="text-muted-foreground text-[11px]">Ou digite a chave secreta manualmente:</p>
                      <code className="block p-1.5 rounded bg-background text-[11px] font-mono text-primary select-all">
                        {mfaSecret}
                      </code>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-muted-foreground">Código de 6 dígitos gerado:</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpVerifyCode}
                    onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-40 text-center text-lg font-mono tracking-widest rounded-lg border border-input bg-background/50 p-2 outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMfaEnrolling(false)}
                    className="rounded-lg border border-border px-3 py-1.5 text-muted-foreground hover:bg-accent"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy || totpVerifyCode.length !== 6}
                    className="rounded-lg bg-primary px-4 py-1.5 font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
                  >
                    Confirmar e Ativar MFA
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;
