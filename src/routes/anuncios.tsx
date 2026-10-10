import { createFileRoute } from "@tanstack/react-router";
  import { useState, useCallback } from "react";
  import { toast } from "sonner";

export const Route = createFileRoute("/anuncios")({
  head: () => ({
    meta: [
      { title: "Adaptador de Anúncios — ToniMaluco C.I" },
      { name: "description", content: "Analise um anúncio que funciona e gere versões originais para cada marketplace." },
      { property: "og:title", content: "Adaptador de Anúncios — ToniMaluco C.I" },
      { property: "og:description", content: "Analise um anúncio que funciona e gere versões originais para cada marketplace." },
    ],
  }),
  component: AnunciosPage,
});

interface RiskClaim {
  phrase: string;
  riskLevel: "alto" | "medio";
  reason: string;
  suggestion: string;
}

interface AuditScore {
  clarity: number;
  socialProof: number;
  warranty: number;
  objections: number;
  readability: number;
  seo: number;
  total: number;
}

interface AdVariation {
  marketplace: string;
  titles: string[];
  description: string;
  keywords: string[];
  strongPoints: string[];
  faq: Array<{ q: string; a: string }>;
  postPurchaseSteps: string[];
  forWho: string;
  notForWho: string;
  complianceWarning?: string;
}

function getFullDescription(v: AdVariation): string {
  let text = v.description;

  if (v.faq && v.faq.length > 0 && !text.toLowerCase().includes("faq") && !text.toLowerCase().includes("perguntas frequentes")) {
    text += `\n\n❓ **Perguntas Frequentes (FAQ):**\n` + v.faq.map((f) => `• ${f.q}\n  ${f.a}`).join("\n");
  }

  if (v.postPurchaseSteps && v.postPurchaseSteps.length > 0 && !text.toLowerCase().includes("passo a passo")) {
    text += `\n\n🚀 **Passo a Passo Pós-Compra:**\n` + v.postPurchaseSteps.join("\n");
  }

  if (v.forWho && !text.toLowerCase().includes("para quem é")) {
    text += `\n\n🎯 **Para quem é:**\n${v.forWho}`;
  }

  if (v.notForWho && !text.toLowerCase().includes("para quem não é")) {
    text += `\n\n⚠️ **Para quem NÃO é:**\n${v.notForWho}`;
  }

  return text;
}

function AnunciosPage() {
  const [referenceAd, setReferenceAd] = useState("");
  // Removed targetPlatform state as we now generate for four fixed marketplaces
  const [tone, setTone] = useState("direto");
  const [category, setCategory] = useState("contas");
  const [price, setPrice] = useState<string>("");
  const [deliveryTime, setDeliveryTime] = useState("Imediata (até 15 min)");
  const [warrantyPeriod, setWarrantyPeriod] = useState("7 dias");

  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState<AdVariation[]>([]);
  const [riskClaims, setRiskClaims] = useState<RiskClaim[]>([]);
  const [audit, setAudit] = useState<AuditScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Removed platforms array as we now use four fixed marketplaces: GGMAX, Mercado Livre, Eneba, Instagram
  const tones = [
    { id: "direto", label: "Direto & Objetivo" },
    { id: "premium", label: "Premium & Autoridade" },
    { id: "agressivo", label: "Agressivo em Preço" },
    { id: "tecnico", label: "Técnico & Detalhado" },
  ];
  const categories = [
    { id: "contas", label: "Contas Digitais" },
    { id: "moedas", label: "Moedas / Pontos" },
    { id: "servicos", label: "Serviços / Upar" },
    { id: "giftcards", label: "Gift Cards / Códigos" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado com sucesso!");
  };

  const generateVariations = useCallback(async () => {
    if (!referenceAd.trim()) {
      toast.error("Por favor, cole um anúncio de referência.");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/generate-ad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceAd,
          tone,
          category,
          price: price ? parseFloat(price) : undefined,
          deliveryTime,
          warrantyPeriod,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      if (data.variations) {
        setVariations(data.variations);
        setRiskClaims(data.riskClaims || []);
        setAudit(data.audit || null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError("Falha ao gerar e auditar anúncio. Tente novamente.");
      toast.error("Falha ao processar anúncio.");
    } finally {
      setGenerating(false);
    }
  }, [referenceAd, tone, category, price, deliveryTime, warrantyPeriod]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="num text-xs uppercase tracking-[0.2em] text-primary">Adaptador & Otimizador de Anúncios</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Reescreva e blinde suas copies digitais.</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Adapte anúncios por plataforma, detecte promessas de risco que geram disputas e insira parâmetros reais de garantia.
        </p>
      </div>

      <div className="glass space-y-5 p-6">
        {/* Destination & Mode Selectors */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Modo de Tom</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/50 p-2.5 text-sm outline-none focus:border-primary/60"
            >
              {tones.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Categoria do Produto</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/50 p-2.5 text-sm outline-none focus:border-primary/60"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-medium text-muted-foreground">Preço (R$ Opcional)</label>
            <input
              type="number"
              placeholder="Ex: 45.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/50 p-2.5 text-sm outline-none focus:border-primary/60"
            />
          </div>
        </div>

        {/* Real Parameters Input */}
        <div className="grid gap-4 sm:grid-cols-2 border-t border-border/40 pt-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-muted-foreground">Tempo Real de Entrega Estimado</label>
            <input
              type="text"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              placeholder="Ex: Imediata (até 15 min)"
              className="w-full rounded-lg border border-input bg-background/40 p-2 text-xs outline-none focus:border-primary/60"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-medium text-muted-foreground">Prazo Real de Garantia / Suporte</label>
            <input
              type="text"
              value={warrantyPeriod}
              onChange={(e) => setWarrantyPeriod(e.target.value)}
              placeholder="Ex: 7 dias corridos"
              className="w-full rounded-lg border border-input bg-background/40 p-2 text-xs outline-none focus:border-primary/60"
            />
          </div>
        </div>

        {/* Reference Ad Textarea */}
        <div>
          <label className="block mb-1.5 text-xs font-medium text-muted-foreground">
            Cole a Copy de Referência (Concorrente ou Antigo)
          </label>
          <textarea
            value={referenceAd}
            onChange={(e) => setReferenceAd(e.target.value)}
            rows={6}
            placeholder="Cole aqui o texto do anúncio de referência..."
            className="w-full resize-none rounded-lg border border-input bg-background/40 p-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        <button
          onClick={generateVariations}
          disabled={generating || !referenceAd.trim()}
          className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
        >
          {generating ? "Analisando, Auditando e Reescrevendo..." : "Auditar e Gerar Anúncio Otimizado"}
        </button>

        {error && <div className="p-3 bg-destructive/20 text-destructive rounded-lg text-xs">{error}</div>}
      </div>

      {/* Audit & Compliance Risk Panel */}
      {audit && (
        <div className="glass space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Auditoria de Qualidade do Anúncio</h2>
            <span className={`num text-xl font-bold px-3 py-1 rounded-full ${audit.total >= 75 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              Score: {audit.total}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
            <div className="p-2.5 rounded-lg border border-border/40 bg-background/30">
              <span className="text-muted-foreground">Clareza:</span> <span className="font-semibold">{audit.clarity}%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/40 bg-background/30">
              <span className="text-muted-foreground">Prova Social:</span> <span className="font-semibold">{audit.socialProof}%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/40 bg-background/30">
              <span className="text-muted-foreground">Política Garantia:</span> <span className="font-semibold">{audit.warranty}%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/40 bg-background/30">
              <span className="text-muted-foreground">Objeções:</span> <span className="font-semibold">{audit.objections}%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/40 bg-background/30">
              <span className="text-muted-foreground">Escaneabilidade:</span> <span className="font-semibold">{audit.readability}%</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/40 bg-background/30">
              <span className="text-muted-foreground">SEO Marketplace:</span> <span className="font-semibold">{audit.seo}%</span>
            </div>
          </div>

          {riskClaims.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                ⚠️ Detector de Promessas de Risco & Reclamações Futuras ({riskClaims.length})
              </h3>
              <div className="space-y-2">
                {riskClaims.map((r, i) => (
                  <div key={i} className="text-xs space-y-0.5 border-t border-amber-500/20 pt-2 first:border-0 first:pt-0">
                    <p className="font-semibold text-foreground">Termo auditado: <span className="text-amber-300">"{r.phrase}"</span></p>
                    <p className="text-muted-foreground">Motivo de risco: {r.reason}</p>
                    <p className="text-emerald-400">Sugestão segura: {r.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Variations Results */}
      {variations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Copies Otimizadas & Cumprimento de Regras</h2>
          {variations.map((v, i) => {
            const fullCopy = getFullDescription(v);
            return (
              <div key={i} className="glass p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <span className="font-display font-semibold text-lg text-primary">{v.marketplace}</span>
                  {v.complianceWarning && (
                    <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                      {v.complianceWarning}
                    </span>
                  )}
                </div>

                {/* A/B Titles */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Títulos A/B Sugeridos (Testar Desempenho)</h3>
                  <div className="space-y-1.5">
                    {v.titles.map((t, ti) => (
                      <div key={ti} className="flex items-center justify-between rounded-lg border border-border/50 bg-background/40 p-2.5 text-xs">
                        <span className="font-medium text-foreground">{t}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => copyToClipboard(t)} className="text-primary hover:underline text-[11px]">Copiar Título</button>
                          <button onClick={() => copyToClipboard(`${t}\n\n${fullCopy}`)} className="text-emerald-400 hover:underline text-[11px]">Copiar Título + Copy</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Integrated Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">Descrição Principal Reescrita (Copy Completa com FAQ e Passo a Passo)</h3>
                    <button onClick={() => copyToClipboard(fullCopy)} className="text-xs text-primary font-medium hover:underline">Copiar Copy Completa 📋</button>
                  </div>
                  <div className="rounded-lg border border-border bg-background/60 p-4">
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{fullCopy}</pre>
                  </div>
                </div>

                {/* Quick Reference Cards */}
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="p-3 rounded-lg border border-border/40 bg-background/20 space-y-2">
                    <h4 className="font-semibold text-primary">FAQ de Objeções (Incluso na Copy Acima)</h4>
                    {v.faq.map((f, fi) => (
                      <div key={fi}>
                        <p className="font-medium text-foreground">Dúvida: {f.q}</p>
                        <p className="text-muted-foreground">{f.a}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg border border-border/40 bg-background/20 space-y-2">
                    <h4 className="font-semibold text-primary">Passo a Passo Pós-Compra (Incluso na Copy Acima)</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {v.postPurchaseSteps.map((step, si) => (
                        <li key={si}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* For Who / Not For Who */}
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                    <span className="font-semibold text-emerald-400">Para quem é:</span> <p className="text-muted-foreground mt-0.5">{v.forWho}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                    <span className="font-semibold text-rose-400">Para quem NÃO é:</span> <p className="text-muted-foreground mt-0.5">{v.notForWho}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}