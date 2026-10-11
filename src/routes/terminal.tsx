import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon, Play, Copy, Check, Trash2, Cpu,
  ShieldCheck, RefreshCw, Sparkles, Layers, ArrowRight, CornerDownLeft,
  Folder, FolderPlus, Save, Bookmark, Clock
} from "lucide-react";
import { toast } from "sonner";
import { recordAiCall, getTelemetryData } from "@/lib/telemetryStore";
import { virtualOS, type VirtualFile } from "@/lib/virtualOS";
import { getProjects, saveOrUpdateSession, getSavedSessions, createProject, type ProjectFolder, type SavedSession } from "@/lib/projectStore";

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
  isExecutableCode?: boolean;
  codeToRun?: string;
}

export function TerminalPage() {
  const [inputCommand, setInputCommand] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>(() => virtualOS.listFiles());
  const [outputs, setOutputs] = useState<CommandOutput[]>([
    {
      id: "welcome-msg",
      command: "init --claude-code --sandbox=webcontainer-os",
      response: `[Claude Code Terminal v2.0 - WebContainer Sandbox Ativo]
✓ Motor de Inteligência: NVIDIA NIM (Nemotron 30B / Qwen Coder)
✓ Ambiente de Execução Real: WebContainer In-Browser (Linux/Node.js Virtual)
✓ Custo Operacional: R$ 0,00 Permanente
✓ Comandos locais suportados: ls, cat <file>, node <file>, pwd, rm <file>, clear
✓ Comandos de IA: Peça scripts, bots ou análises e clique em [Executar Script no Sandbox]`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      provider: "Ambiente WebContainer",
    },
  ]);
  const [providerInfo, setProviderInfo] = useState<{
    activeProvider: string;
    hasNvidia: boolean;
    hasOpenRouter: boolean;
    hasOpenAI: boolean;
    telemetry: {
      creditsLimit: number;
      creditsUsed: number;
      creditsRemaining: number;
    };
  }>({
    activeProvider: "Detectando...",
    hasNvidia: false,
    hasOpenRouter: false,
    hasOpenAI: false,
    telemetry: {
      creditsLimit: 1000,
      creditsUsed: 42,
      creditsRemaining: 958,
    },
  });

  // Projetos & Sessões Salvas do Terminal
  const [projects, setProjects] = useState<ProjectFolder[]>(() => getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [savedTerminalSessions, setSavedTerminalSessions] = useState<SavedSession[]>(() => getSavedSessions("terminal"));
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `term-${Date.now()}`);

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
          hasOpenAI: data.hasOpenAI,
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
        hasNvidia: false,
        hasOpenRouter: false,
        hasOpenAI: false,
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
    const trimmed = cmd.trim();

    // 1. Comando 'clear'
    if (trimmed === "clear") {
      setOutputs([]);
      return;
    }

    setIsRunning(true);
    const newId = `cmd-${Date.now()}`;
    const newOutput: CommandOutput = {
      id: newId,
      command: cmd,
      response: "",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      provider: providerInfo.activeProvider, // temporary, will be updated from header
    };

    setOutputs((prev) => [...prev, newOutput]);

    // 2. Se for um comando de shell local (ls, cat, node, pwd, whoami, rm, echo, tokens, quota)
    const firstWord = (trimmed.split(/\s+/)[0] || "").toLowerCase();
    const localCommands = ["ls", "cat", "node", "pwd", "whoami", "date", "env", "rm", "echo", "run", "tokens", "quota"];

    if (localCommands.includes(firstWord)) {
      setTimeout(async () => {
        const res = await virtualOS.executeCommand(trimmed);
        const resultText = res.stderr ? `[STDERR]\n${res.stderr}` : res.stdout || "(sem saída)";

        setOutputs((prev) =>
          prev.map((o) => (o.id === newId ? {
            ...o,
            response: resultText,
            provider: "WebContainer Local",
          } : o))
        );
        setVirtualFiles(virtualOS.listFiles());
        setIsRunning(false);
      }, 150);
      return;
    }

    // 3. Se for uma solicitação de IA / Claude Code
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

      // Get provider from header, fallback to state or unknown
      const providerFromHeader = res.headers.get("X-Provider-Used") || providerInfo.activeProvider || "Desconhecido";

      const promptTokens = Number(res.headers.get("X-Prompt-Tokens")) || 0;
      const completionTokens = Number(res.headers.get("X-Completion-Tokens")) || 0;
      const totalTokens = Number(res.headers.get("X-Total-Tokens")) || 0;
      const modelUsed = res.headers.get("X-Model-Used") || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

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
            prev.map((o) => (o.id === newId ? {
              ...o,
              response: fullText,
              provider: providerFromHeader,
            } : o))
          );
        }
      } else {
        const text = await res.text();
        fullText = text;
        setOutputs((prev) =>
          prev.map((o) => (o.id === newId ? {
            ...o,
            response: text,
            provider: providerFromHeader,
          } : o))
        );
      }

      // Detecta APENAS blocos reais de código executável em JavaScript/TypeScript (evita bash ou simples texto de terminal)
      const codeMatch = fullText.match(/```(?:javascript|js|node|typescript|ts)\s*([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        const extractedCode = codeMatch[1].trim();
        // Não salva se for apenas prompt bash ou comando único
        const isNotBashExample = !extractedCode.startsWith("$") && !extractedCode.startsWith("npm") && !extractedCode.startsWith("git");
        if (isNotBashExample && (extractedCode.includes("console.log") || extractedCode.includes("function") || extractedCode.includes("const ") || extractedCode.includes("let "))) {
          const autoFileName = `script_${Date.now().toString().slice(-4)}.js`;
          virtualOS.writeFile(autoFileName, extractedCode);
          setVirtualFiles(virtualOS.listFiles());

          setOutputs((prev) =>
            prev.map((o) =>
              o.id === newId
                ? {
                    ...o,
                    isExecutableCode: true,
                    codeToRun: autoFileName,
                  }
                : o
            )
          );
        }
      }

      // Grava telemetria real no store se houve tokens
      if (totalTokens > 0 || fullText.length > 0) {
        const computedTokens = totalTokens > 0 ? totalTokens : Math.round((cmd.length + fullText.length) / 4);
        const updatedTele = recordAiCall({
          provider: "nvidia-nim",
          model: modelUsed,
          promptTokens: promptTokens || Math.round(cmd.length / 4),
          completionTokens: completionTokens || Math.round(fullText.length / 4),
          totalTokens: computedTokens,
          commandSnippet: cmd,
        });

        setProviderInfo((prev) => ({
          ...prev,
          telemetry: {
            creditsLimit: updatedTele.creditsLimitNvidia,
            creditsUsed: updatedTele.creditsUsedNvidia,
            creditsRemaining: updatedTele.creditsRemainingNvidia,
          },
        }));
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

  // Executa arquivo no Sandbox virtual com 1 clique
  const handleRunInSandbox = async (fileName: string) => {
    handleExecute(`node ${fileName}`);
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

        {/* Telemetria e Controles de Projeto / Registro */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Projeto / Pasta */}
          <div className="flex items-center gap-1.5 rounded-xl bg-card/60 border border-border/50 px-3 py-1.5 text-xs">
            <Folder className="h-3.5 w-3.5 text-primary" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs text-foreground outline-none font-medium cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-zinc-300">Sem pasta (Avulso)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-zinc-300">
                  📁 {p.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowNewProjModal(true)}
              className="p-1 hover:text-primary transition"
              title="Nova pasta de projeto"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Seletor de Sessões Salvas Anteriores */}
          {savedTerminalSessions.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-card/60 border border-border/50 px-3 py-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <select
                onChange={(e) => {
                  const targetSession = savedTerminalSessions.find((s) => s.id === e.target.value);
                  if (targetSession && Array.isArray(targetSession.data)) {
                    setOutputs(targetSession.data);
                    setCurrentSessionId(targetSession.id);
                    if (targetSession.projectId) setSelectedProjectId(targetSession.projectId);
                    toast.success(`Sessão '${targetSession.title}' restaurada!`);
                  }
                }}
                defaultValue=""
                className="bg-transparent text-xs text-foreground outline-none font-medium cursor-pointer max-w-[130px] truncate"
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-300">Sessões Salvas ({savedTerminalSessions.length})</option>
                {savedTerminalSessions.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-zinc-300">
                    💾 {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botão de Salvar Sessão do Terminal */}
          <button
            onClick={() => {
              const snippet = outputs.slice(-1)[0]?.command || "Sessão Terminal";
              saveOrUpdateSession({
                id: currentSessionId,
                type: "terminal",
                title: snippet.slice(0, 45),
                projectId: selectedProjectId || undefined,
                createdAt: new Date().toISOString(),
                data: outputs,
              });
              setSavedTerminalSessions(getSavedSessions("terminal"));
              toast.success("Sessão do Terminal registrada no projeto com sucesso!");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-semibold transition"
            title="Salvar comandos e respostas desta sessão"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Salvar Sessão</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl bg-card/60 border border-border/50 px-3 py-1.5 text-xs">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">{providerInfo.activeProvider}</span>
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" /> Seguro
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

      {/* Modal Rápido de Criação de Projeto */}
      {showNewProjModal && (
        <div className="p-3 bg-zinc-900/95 border border-primary/40 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2 flex-1">
            <FolderPlus className="h-4 w-4 text-primary shrink-0" />
            <input
              type="text"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newProjName.trim()) {
                  const created = createProject(newProjName);
                  setProjects(getProjects());
                  setSelectedProjectId(created.id);
                  setNewProjName("");
                  setShowNewProjModal(false);
                  toast.success(`Pasta de Projeto '${created.name}' criada!`);
                }
              }}
              placeholder="Nome da nova pasta de projeto (ex: Automações Mercado Livre)..."
              className="bg-zinc-800 px-3 py-1.5 rounded-lg text-foreground outline-none flex-1 font-mono text-xs border border-zinc-700"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!newProjName.trim()) return;
                const created = createProject(newProjName);
                setProjects(getProjects());
                setSelectedProjectId(created.id);
                setNewProjName("");
                setShowNewProjModal(false);
                toast.success(`Pasta de Projeto '${created.name}' criada!`);
              }}
              className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:brightness-110 transition"
            >
              Criar Pasta
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
        <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
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

          {/* Arquivos no Sandbox Virtual */}
          <div className="hidden md:flex items-center gap-2 shrink-0 border-l border-zinc-800 pl-3">
            <Layers className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Arquivos Sandbox:</span>
            {virtualFiles.slice(0, 3).map((f) => (
              <button
                key={f.name}
                onClick={() => handleExecute(`cat ${f.name}`)}
                className="px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 border border-zinc-700/40 text-[10px] transition"
                title={`Ver conteúdo de ${f.name}`}
              >
                {f.name}
              </button>
            ))}
          </div>
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
              <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800/60 text-zinc-200 whitespace-pre-wrap font-mono select-text relative">
                {out.response || (
                  <span className="text-primary flex items-center gap-2 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Executando análise com motor Claude Code...
                  </span>
                )}

                {/* Botão de Execução Instantânea no Sandbox */}
                {out.isExecutableCode && out.codeToRun && (
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                        {out.codeToRun}
                      </span>
                      <span>salvo no Sandbox Virtual</span>
                    </div>

                    <button
                      onClick={() => handleRunInSandbox(out.codeToRun!)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Executar no Sandbox (Custo Zero)
                    </button>
                  </div>
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