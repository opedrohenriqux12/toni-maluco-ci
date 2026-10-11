import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import { 
  Terminal as TerminalIcon, Play, Copy, Check, Trash2, Cpu, 
  ShieldCheck, RefreshCw, Sparkles, Layers, ArrowRight, CornerDownLeft
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/terminal")({
  head: () => ({
    meta: [
      { title: "Terminal Claude Code — ToniMaluco C.I" },
      { name: "description", content: "Terminal integrado com suporte à API NVIDIA NIM e Claude Code para automação e scripts." },
    ],
  }),
  component: TerminalPage,
});

interface CommandOutput {
  id: string;
  command: string;
  response: string;
  timestamp: string;
  provider: string;
}

export function TerminalPage() {
  const [inputCommand, setInputCommand] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    {
      id: "welcome-msg",
      command: "init --claude-code --mode=ci-ops",
      response: `[Claude Code Terminal v1.4] Inicializado com sucesso.
✓ Backend seguro conectado (Vercel Edge / Node.js)
✓ Suporte a chaves NVIDIA NIM e OpenRouter protegidas no servidor
✓ Chaves NÃO expostas no front-end
✓ Digite sua solicitação em linguagem natural ou comandos de script.`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      provider: "Sistema Central",
    },
  ]);
  const [providerInfo, setProviderInfo] = useState<{
    activeProvider: string;
    hasNvidia: boolean;
    hasOpenRouter: boolean;
    telemetry: {
      creditsLimit: number;
      creditsUsed: number;
      creditsRemaining: number;
    };
  }>({
    activeProvider: "Detectando...",
    hasNvidia: false,
    hasOpenRouter: false,
    telemetry: {
      creditsLimit: 1000,
      creditsUsed: 42,
      creditsRemaining: 958,
    },
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Carrega status da API segura no backend
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/terminal");
      if (res.ok) {
        const data = await res.json();
        setProviderInfo({
          activeProvider: data.activeProvider,
          hasNvidia: data.hasNvidia,
          hasOpenRouter: data.hasOpenRouter,
          telemetry: {
            creditsLimit: data.telemetry?.monthlyCreditsLimit || 1000,
            creditsUsed: data.telemetry?.creditsUsed || 42,
            creditsRemaining: data.telemetry?.creditsRemaining || 958,
          },
        });
      }
    } catch {
      setProviderInfo((prev) => ({
        ...prev,
        activeProvider: "Offline / Simulação Inteligente",
      }));
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputs, isRunning]);

  const handleExecute = async (cmdToRun?: string) => {
    const cmd = cmdToRun || inputCommand;
    if (!cmd.trim() || isRunning) return;

    setInputCommand("");
    setIsRunning(true);

    const newId = `cmd-${Date.now()}`;
    const newOutput: CommandOutput = {
      id: newId,
      command: cmd,
      response: "",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      provider: providerInfo.activeProvider,
    };

    setOutputs((prev) => [...prev, newOutput]);

    try {
      const res = await fetch("/api/terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmd,
          history: outputs.slice(-4).map((o) => ({ role: "user", content: o.command })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Falha no servidor (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setOutputs((prev) =>
            prev.map((o) => (o.id === newId ? { ...o, response: fullText } : o))
          );
        }
      } else {
        const text = await res.text();
        setOutputs((prev) =>
          prev.map((o) => (o.id === newId ? { ...o, response: text } : o))
        );
      }
    } catch (err: any) {
      setOutputs((prev) =>
        prev.map((o) =>
          o.id === newId
            ? { ...o, response: `[ERRO] ${err?.message || "Não foi possível concluir o comando."}` }
            : o
        )
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const quickCommands = [
    { label: "Scraper Mercado Livre", cmd: "Criar scraper em Python para monitorar preços de gift cards no Mercado Livre" },
    { label: "Engenharia Reversa REA", cmd: "Explicar como usar o REA MCP para auditar endpoints da concorrência" },
    { label: "Bot de Atendimento Grok", cmd: "Gerar webhook em Node.js para validar comprovantes PIX com IA" },
    { label: "Otimizar Margens", cmd: "Calcular taxa GGMAX de 12% + 2.5% de pagamento e sugerir preço ótimo" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageTitle
          kicker="CLAUDE CODE & IA RUNTIME"
          title="Terminal Integrado de Engenharia"
        >
          Ambiente de execução de comandos e criação de automações com chaves de IA protegidas no backend.
        </PageTitle>

        {/* Telemetria do Provedor Conectado */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-card/60 border border-border/50 px-3.5 py-1.5 text-xs">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Motor:</span>
            <span className="font-semibold text-foreground">{providerInfo.activeProvider}</span>
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" /> Seguro (Zero Leaks)
            </span>
          </div>

          <button
            onClick={fetchStatus}
            className="p-2 rounded-xl border border-border bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card transition"
            title="Recarregar status de conexão"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="rounded-2xl border border-border/80 bg-zinc-950 shadow-2xl overflow-hidden font-mono text-xs flex flex-col min-h-[580px]">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-zinc-400 select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-zinc-500 ml-2">|</span>
            <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <TerminalIcon className="h-3.5 w-3.5 text-primary" /> claude-code@toni-maluco-ci:~
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              NVIDIA NIM & OpenRouter Protegidos
            </span>
            <button
              onClick={() => setOutputs([])}
              className="text-zinc-500 hover:text-zinc-300 transition p-1"
              title="Limpar terminal"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Command Pills */}
        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-zinc-500 shrink-0 uppercase tracking-wider font-semibold">Atalhos:</span>
          {quickCommands.map((q) => (
            <button
              key={q.label}
              onClick={() => handleExecute(q.cmd)}
              disabled={isRunning}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/60 text-[11px] transition whitespace-nowrap disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-6 text-zinc-300 leading-relaxed max-h-[500px]">
          {outputs.map((out) => (
            <div key={out.id} className="space-y-2 group">
              {/* User prompt line */}
              <div className="flex items-center justify-between gap-2 text-zinc-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-emerald-400 font-bold">toni-maluco@agent:~$</span>
                  <span className="text-zinc-100 font-semibold">{out.command}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 opacity-60 group-hover:opacity-100 transition">
                  <span>{out.timestamp}</span>
                  <button
                    onClick={() => handleCopy(out.response)}
                    className="p-1 hover:text-zinc-200 transition"
                    title="Copiar resposta"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Assistant Response Box */}
              <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60 text-zinc-200 whitespace-pre-wrap font-mono select-text">
                {out.response || (
                  <span className="text-primary flex items-center gap-2 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Executando análise com motor Claude Code...
                  </span>
                )}
              </div>
            </div>
          ))}

          {isRunning && outputs[outputs.length - 1]?.response === "" && (
            <div className="flex items-center gap-2 text-primary animate-pulse py-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span>Processando tokens em streaming...</span>
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Box */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold pl-2 select-none">
            <span>&gt;</span>
          </div>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleExecute();
            }}
            placeholder="Digite um comando bash, prompt de engenharia ou tarefa de e-commerce..."
            disabled={isRunning}
            className="flex-1 bg-transparent text-zinc-100 outline-none placeholder:text-zinc-600 font-mono text-xs disabled:opacity-50"
          />
          <button
            onClick={() => handleExecute()}
            disabled={isRunning || !inputCommand.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:brightness-110 transition disabled:opacity-50 glow"
          >
            <CornerDownLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Executar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TerminalPage;
