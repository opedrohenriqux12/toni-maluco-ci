import { createFileRoute } from "@tanstack/react-router";
  import { useState, useEffect } from "react";
  import { toast } from "sonner";

export const Route = createFileRoute("/scripts")({
  head: () => ({
    meta: [
      { title: "Scripts de Vendas — ToniMaluco C.I" },
      { name: "description", content: "Scripts por canal, quebra de objeções e modelos de pós-venda." },
      { property: "og:title", content: "Scripts de Vendas — ToniMaluco C.I" },
      { property: "og:description", content: "Scripts por canal, quebra de objeções e modelos de pós-venda." },
    ],
  }),
  component: ScriptsPage,
});

function ScriptsPage() {
  const [channel, setChannel] = useState("whatsapp");
  const [tone, setTone] = useState("friendly");
  const [situation, setSituation] = useState("approach");
  const [generating, setGenerating] = useState(false);
  const [script, setScript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id: string; channel: string; tone: string; situation: string; script: string; date: string }>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("scripts_history");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });
  const [searchHistory, setSearchHistory] = useState("");
  const [activeTab, setActiveTab] = useState<"builder" | "objections" | "crises" | "history">("builder");

  const channels = [
    { value: "whatsapp", label: "WhatsApp", desc: "Mensagens diretas e rápidas" },
    { value: "ggmax_chat", label: "Chat do Marketplace", desc: "GGMAX, Eneba e Mercado Livre" },
    { value: "instagram_dm", label: "Instagram DM", desc: "Abordagem visual e engajada" },
    { value: "discord", label: "Discord", desc: "Comunidades e chamadas privadas" },
    { value: "telegram", label: "Telegram", desc: "Grupos e suporte direto" },
  ];

  const tones = [
    { value: "friendly", label: "Amigável", desc: "Empático e acolhedor" },
    { value: "gamer", label: "Gamer", desc: "Descontraído com termos de jogos" },
    { value: "formal", label: "Formal", desc: "Profissional e respeitoso" },
    { value: "urgent", label: "Urgente", desc: "Senso de escassez e rapidez" },
  ];

  const situations = [
    { value: "approach", label: "Abordagem inicial", desc: "Primeiro contato" },
    { value: "qualification", label: "Qualificação", desc: "Entender necessidade" },
    { value: "objection", label: "Quebra de objeção", desc: "Dúvidas e desconfiança" },
    { value: "closing", label: "Fechamento", desc: "Envio do link/Pix" },
    { value: "upsell", label: "Upsell & Cross-sell", desc: "Oferta complementar" },
    { value: "post_sale", label: "Pós-venda", desc: "Entrega e 5 estrelas" },
  ];

  const objectionsPreset = [
    { q: "É seguro comprar com você?", sit: "objection", desc: "Resposta focada em avaliações, tempo de mercado e intermediação da plataforma." },
    { q: "Tem garantia se der problema?", sit: "objection", desc: "Garantia de reposição ou reembolso em até 7 dias." },
    { q: "Por que está mais barato que o oficial?", sit: "objection", desc: "Explicação sobre parcerias regionais e lote em volume." },
    { q: "Como funciona a entrega?", sit: "objection", desc: "Passo a passo simples de resgate do gift card ou conta." },
  ];

  const crisesPreset = [
    { title: "Atraso na Entrega", sit: "post_sale", desc: "Script de acalmamento e código de compensação/brinde." },
    { title: "Pedido de Reembolso", sit: "post_sale", desc: "Procedimento seguro sem bate-boca para proteger conta." },
    { title: "Dúvida de Segurança", sit: "objection", desc: "Verificação de dados sem expor informações confidenciais." },
    { title: "Avaliação Negativa", sit: "post_sale", desc: "Reversão amigável para transformar 1 estrela em 5 estrelas." },
  ];

  useEffect(() => {
    if (channel && tone && situation) {
      generateScript();
    }
  }, [channel, tone, situation]);

  const generateScript = async (customSit?: string, customTone?: string, customChan?: string) => {
    const c = customChan || channel || "whatsapp";
    const t = customTone || tone || "friendly";
    const s = customSit || situation || "approach";

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: c, tone: t, situation: s }),
      });
      const data = await response.json();
      if (data.script) {
        setScript(data.script);
        saveToHistory(c, t, s, data.script);
      } else {
        throw new Error("Invalid response");
      }
    } catch {
      const generated = await gerarScript(c, t, s);
      setScript(generated);
      saveToHistory(c, t, s, generated);
    } finally {
      setGenerating(false);
    }
  };

  const saveToHistory = (c: string, t: string, s: string, text: string) => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      channel: c,
      tone: t,
      situation: s,
      script: text,
      date: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev.filter((h) => h.script !== text)].slice(0, 20);
      localStorage.setItem("scripts_history", JSON.stringify(updated));
      return updated;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Script copiado para a área de transferência!");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="num text-xs uppercase tracking-[0.2em] text-primary">Gerador de Scripts</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Do primeiro oi à avaliação cinco estrelas.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Fluxos completos por canal, em quatro tons, sem promessa falsa nem escassez inventada.
        </p>
      </div>

      {/* Interactive Feature Cards Grid matching the screenshot */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          onClick={() => setActiveTab("builder")}
          className={`glass p-5 transition cursor-pointer hover:border-primary/50 hover:glow ${activeTab === "builder" ? "glow border-primary/60" : ""}`}
        >
          <h3 className="font-display font-semibold text-lg text-foreground">Canais & Tons</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Chat do marketplace, WhatsApp, Discord, Instagram DM e Telegram em 4 tons.
          </p>
          <span className="mt-3 inline-block text-xs text-primary font-medium">Configurar script →</span>
        </div>

        <div
          onClick={() => setActiveTab("objections")}
          className={`glass p-5 transition cursor-pointer hover:border-primary/50 hover:glow ${activeTab === "objections" ? "glow border-primary/60" : ""}`}
        >
          <h3 className="font-display font-semibold text-lg text-foreground">Biblioteca de objeções</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            "É seguro?", "Tem garantia?", preço e entrega, ranqueadas pelo seu sucesso.
          </p>
          <span className="mt-3 inline-block text-xs text-primary font-medium">Ver objeções →</span>
        </div>

        <div
          onClick={() => setActiveTab("crises")}
          className={`glass p-5 transition cursor-pointer hover:border-primary/50 hover:glow ${activeTab === "crises" ? "glow border-primary/60" : ""}`}
        >
          <h3 className="font-display font-semibold text-lg text-foreground">Situações difíceis</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Atraso, reembolso, dúvida de segurança e reversão de avaliação negativa.
          </p>
          <span className="mt-3 inline-block text-xs text-primary font-medium">Gerenciar crise →</span>
        </div>
      </div>

      {/* Main Interactive Controls */}
      <div className="glass p-6">
        {activeTab === "builder" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">1. Escolha o Canal</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {channels.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setChannel(c.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      channel === c.value ? "border-primary bg-primary/10 text-primary glow" : "border-border hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{c.label}</p>
                    <p className="text-[11px] opacity-75 truncate">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">2. Escolha o Tom</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tones.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      tone === t.value ? "border-primary bg-primary/10 text-primary glow" : "border-border hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-[11px] opacity-75">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">3. Etapa do Fluxo de Vendas</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {situations.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSituation(s.value)}
                    className={`p-3 rounded-lg border text-left transition ${
                      situation === s.value ? "border-primary bg-primary/10 text-primary glow" : "border-border hover:bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-xs">{s.label}</p>
                    <p className="text-[10px] opacity-75 truncate">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "objections" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Biblioteca de Quebra de Objeções (1-Clique)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {objectionsPreset.map((obj, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-background/40 hover:border-primary/40 transition">
                  <p className="font-semibold text-sm text-primary">"{obj.q}"</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{obj.desc}</p>
                  <button
                    onClick={() => {
                      setSituation(obj.sit);
                      generateScript(obj.sit, tone || "friendly", channel || "whatsapp");
                    }}
                    className="rounded bg-primary/20 border border-primary/40 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/30"
                  >
                    Gerar resposta instantânea
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "crises" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Gestão de Situações Difíceis & Suporte (1-Clique)</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {crisesPreset.map((cr, i) => (
                <div key={i} className="p-4 rounded-lg border border-border bg-background/40 hover:border-primary/40 transition">
                  <p className="font-semibold text-sm text-destructive">{cr.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">{cr.desc}</p>
                  <button
                    onClick={() => {
                      setSituation(cr.sit);
                      generateScript(cr.sit, tone || "formal", channel || "whatsapp");
                    }}
                    className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground font-medium hover:brightness-110"
                  >
                    Gerar script de contingência
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Script Result Box */}
        {script && (
          <div className="mt-8 border-t border-border pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-semibold">Script Gerado</h3>
              <button
                onClick={() => copyToClipboard(script)}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:brightness-110 transition"
              >
                Copiar Script 📋
              </button>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{script}</pre>
            </div>
          </div>
        )}

        {generating && (
          <div className="mt-6 text-center text-sm text-primary animate-pulse">
            Escrevendo script personalizado...
          </div>
        )}
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Histórico de Scripts Gerados</h2>
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              className="rounded-lg border border-input bg-background/40 px-3 py-1 text-xs outline-none focus:border-primary/60"
            />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history
              .filter((h) => h.script.toLowerCase().includes(searchHistory.toLowerCase()))
              .map((h) => (
                <div key={h.id} className="p-3 rounded-lg border border-border/50 bg-background/30 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-xs font-medium text-primary uppercase">{h.channel} · {h.tone} · {h.situation}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{h.script.split("\n")[0]}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(h.script)}
                    className="text-xs text-muted-foreground hover:text-foreground border border-border px-2 py-1 rounded"
                  >
                    Copiar
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Generate a script based on selections
async function gerarScript(channel: string, tone: string, situation: string): Promise<string> {
  // In a real implementation, you would call an AI API here.
  // For now, we'll return a simulated script based on the selections.

  const channelMap: Record<string, string> = {
    whatsapp: "WhatsApp",
    ggmax_chat: "GGMAX Chat",
    instagram_dm: "Instagram DM",
  };

  const toneMap: Record<string, string> = {
    friendly: "amigável e descontraído",
    gamer: "descontraído com referências de jogos",
    formal: "profissional e respeitoso",
    urgent: "direto e com senso de urgência",
  };

  const situationMap: Record<string, string> = {
    approach: "abordagem inicial",
    objection: "quebra de objeção",
    post_sale: "follow-up pós-venda",
  };

  const channelLabel = channelMap[channel] || channel;
  const toneLabel = toneMap[tone] || tone;
  const situationLabel = situationMap[situation] || situation;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate script based on situation
  let scriptContent = "";

  switch (situation) {
    case "approach":
      scriptContent = [
        `Olá! Tudo bem? Meu nome é [Seu Nome] e eu especializo em ajudar pessoas como você a [resultado desejado].`,
        "",
        "Percebi que você [observação sobre o potencial cliente] e pensei que poderia estar interessado em descobrir como [benefício específico].",
        "",
        "Você teria alguns minutos agora para uma conversa rápida para eu entender melhor sua situação e ver se posso ajudar?",
        "",
        "Se for um bom momento, posso fazer apenas 3 perguntas rápidas para entender suas necessidades e então compartilhar como nós podemos ajudar você a [resultado específico].",
        "",
        "Se não for um bom momento, quando seria melhor para retomarmos essa conversa?",
      ].join("\n");
      break;
    case "objection":
      scriptContent = [
        "Entendo completamente sua preocupação. Muitos dos nossos clientes tinham a mesma dúvida inicialmente.",
        "",
        "O que eu descobri é que [explicação queaddressa a objeção]. Na verdade, [dados ou prova social que contrabalança a objeção].",
        "",
        "Por exemplo, [cliente semelhante] tinha exatamente essa mesma preocupação e após [período de tempo], ele/ela [resultado positivo].",
        "",
        "Você gostaria que eu compartilhasse como isso funciona na prática para alguém na sua situação específica?",
      ].join("\n");
      break;
    case "post_sale":
      scriptContent = [
        "Olá! Só queria verificar como está tudo com sua compra recente de [produto/serviço].",
        "",
        "Tudo está funcionando como esperado? Houve alguma dúvida ou dificuldade que eu possa ajudar a resolver agora?",
        "",
        "Se você estiver satisfeito, teria um minutinho para deixar um rápido feedback? Isso nos ajuda muito a melhorar nosso serviço e ajudar outras pessoas.",
        "",
        "Também quero lembrar que você tem acesso a [benefício adicional ou suporte] e estou aqui para ajudar com qualquer coisa que precisar.",
      ].join("\n");
      break;
    default:
      scriptContent = [
        "Olá! Como posso ajudá-lo hoje?",
        "",
        "Estou aqui para entender suas necessidades e ver se posso oferecer uma solução que faça sentido para você.",
        "",
        "Você poderia me contar um pouco mais sobre [tópico relevante]?",
      ].join("\n");
  }

  // Add tone-specific adjustments
  const toneAdjustments: Record<string, string> = {
    friendly: "\n\nLembre-se de manter um tom amigável, usar emojis moderadamente e mostrar empatia genuína.",
    gamer: "\n\nUse linguagem de jogos, referências a níveis, power-ups e mantenha o ritmo energético.",
    formal: "\n\nMantenha linguagem profissional, evite gírias e estrutura a conversa de forma clara e objetiva.",
    urgent: "\n\nUse frases curtas, destaque prazos limitados e crie senso de oportunidade sem ser pressionante.",
  };

  return [
    `=== Script para ${channelLabel} ===`,
    `Tom: ${toneLabel}`,
    `Situação: ${situationLabel}`,
    "",
    scriptContent,
    "",
    toneAdjustments[tone],
  ].join("\n");
}