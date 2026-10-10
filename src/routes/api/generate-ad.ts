import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, type UIMessage } from "ai";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

interface AdRequest {
  referenceAd: string;
  targetPlatform?: string;
  tone?: string;
  price?: number;
  deliveryTime?: string;
  warrantyPeriod?: string;
  category?: string;
}

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

export const Route = createFileRoute("/api/generate-ad")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as AdRequest;
        const { referenceAd, targetPlatform, tone = "direto", price, deliveryTime = "Imediata (até 15 min)", warrantyPeriod = "7 dias", category = "contas" } = body;

        if (!referenceAd || !referenceAd.trim()) {
          return json(400, { error: "Anúncio de referência é obrigatório." });
        }

        // Determine marketplaces: if targetPlatform is provided and not empty, use it; else use the four marketplaces.
        const marketplaces = targetPlatform && targetPlatform.trim() !== ""
          ? [targetPlatform.trim()]
          : ["GGMAX", "Mercado Livre", "Eneba", "Instagram"];

        // Detect risk claims and bad promises in reference ad
        const riskClaims: RiskClaim[] = [];
        const lowerRef = referenceAd.toLowerCase();

        if (lowerRef.includes("100% seguro") || lowerRef.includes("sem risco")) {
          riskClaims.push({
            phrase: "100% seguro / sem risco",
            riskLevel: "alto",
            reason: "Você não controla 100% o algoritmo nem o comprador. Promessa não verificável que gera disputas.",
            suggestion: "Substitua por 'Processo verificado e suporte completo durante o acesso'.",
          });
        }
        if (lowerRef.includes("sem bloqueio") || lowerRef.includes("nunca cai") || lowerRef.includes("antibloqueio")) {
          riskClaims.push({
            phrase: "sem bloqueio / nunca cai",
            riskLevel: "alto",
            reason: "Contas de redes/games podem sofrer checagem se o comprador mudar IP ou padrão abruptamente.",
            suggestion: "Substitua por 'Orientações de aquecimento e uso recomendadas para estabilidade'.",
          });
        }
        if (lowerRef.includes("instagram") || lowerRef.includes("conta instagram")) {
          riskClaims.push({
            phrase: "Venda de conta Instagram",
            riskLevel: "alto",
            reason: "Termos da Meta proíbem venda/transferência de contas de terceiros. Alto risco de denúncia fora do marketplace.",
            suggestion: "Siga rigorosamente as regras de comunicação interna do marketplace sem links externos.",
          });
        }
        if (lowerRef.includes("maturada") && !lowerRef.includes("ano")) {
          riskClaims.push({
            phrase: "Conta maturada (sem especificação)",
            riskLevel: "medio",
            reason: "Termo vago. O comprador espera dados numéricos reais de criação ou atividade.",
            suggestion: "Informe o ano exato de criação (ex: 2021) e faixa de atividade.",
          });
        }

        // Audit score calculation
        const audit: AuditScore = {
          clarity: lowerRef.length > 50 ? 80 : 50,
          socialProof: lowerRef.includes("avaliações") || lowerRef.includes("vendas") ? 75 : 30,
          warranty: lowerRef.includes("garantia") ? 85 : 40,
          objections: lowerRef.includes("como funciona") || lowerRef.includes("dúvida") ? 80 : 35,
          readability: lowerRef.includes("✅") || lowerRef.includes("•") || referenceAd.includes("\n") ? 90 : 45,
          seo: referenceAd.split(/\s+/).length > 20 ? 85 : 50,
          total: 0,
        };
        audit.total = Math.round((audit.clarity + audit.socialProof + audit.warranty + audit.objections + audit.readability + audit.seo) / 6);

        const apiKey = process.env["OPENAI_API_KEY"];
        if (apiKey) {
          const provider = createOpenAI({ apiKey });

          // We'll generate variations for each marketplace sequentially
          const variations: AdVariation[] = [];

          for (const marketplace of marketplaces) {
            const prompt = `Você é um especialista em Copywriting e Conformidade de Anúncios para Marketplaces Digitais (GGMAX, EFG, Gamemarket, Mercado Livre).

Análise e Reescreva o anúncio abaixo sem copiar frases literalmente.
Anúncio Referência: "${referenceAd}"
Plataforma Alvo: ${marketplace}
Tom desejado: ${tone}
Categoria: ${category}
Dados reais inseridos: Preço = ${price ? `R$${price}` : "A consultar"}, Entrega = ${deliveryTime}, Garantia = ${warrantyPeriod}.

IMPORTANTE: O campo "description" DEVE CONTER A COPY COMPLETA E INTEGRADA, incluindo todos os blocos:
1. Título/Diferenciais com emojis ✅
2. O que você recebe
3. Política de Suporte e Garantia (${warrantyPeriod})
4. Perguntas Frequentes (FAQ)
5. Passo a Passo Pós-Compra
6. Para quem é / Para quem NÃO é

Gere a resposta EXATAMENTE no formato JSON:
{
  "variations": [
    {
      "marketplace": "${marketplace}",
      "titles": [
        "Título 1 com SEO e Emoji",
        "Título 2 focado em Autoridade",
        "Título 3 Direto e Objetivo"
      ],
      "description": "Copy completa reescrita com tópicos, emojis ✅, sem promessas falsas de '100% sem ban', com dados reais de entrega (${deliveryTime}) e garantia (${warrantyPeriod}). DEVE INCLUIR TODOS OS BLOCOS: Diferenciais, O que recebe, Suporte, FAQ, Passo a passo pós-compra e Para quem é/não é.",
      "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
      "strongPoints": ["Ponto 1", "Ponto 2", "Ponto 3", "Ponto 4"],
      "faq": [
        {"q": "Como funciona a entrega?", "a": "Entrega digital via chat do marketplace em até ${deliveryTime}."},
        {"q": "Qual o prazo de garantia?", "a": "Oferecemos ${warrantyPeriod} de garantia de acesso e suporte."}
      ],
      "postPurchaseSteps": [
        "1. Acesse o chat do pedido após a confirmação do pagamento.",
        "2. Receba as credenciais e o guia de acesso seguro.",
        "3. Verifique o item e confirme o recebimento para liberar a avaliação."
      ],
      "forWho": "Ideal para quem busca agilidade e entrega garantida por intermediador oficial.",
      "notForWho": "Não indicado para quem tenta burlar os termos da plataforma ou utilizar dados falsos.",
      "complianceWarning": "Respeite as regras de comunicação interna do marketplace. Não passe contatos externos."
    }
  ]
}`;

            try {
              const result = await generateText({
                model: provider("gpt-4o-mini"),
                prompt,
              });
              const text = result.text;
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
              if (parsed.variations && Array.isArray(parsed.variations)) {
                variations.push(...parsed.variations);
              } else {
                variations.push(createFallbackVariation(marketplace, category, tone, price, deliveryTime, warrantyPeriod));
              }
            } catch (err) {
              console.error(`OpenAI ad error for marketplace ${marketplace}`, err);
              variations.push(createFallbackVariation(marketplace, category, tone, price, deliveryTime, warrantyPeriod));
            }
          }

          return json(200, { variations, riskClaims, audit });
        }

        // Fallback simulation
        const variations: AdVariation[] = [];
        for (const marketplace of marketplaces) {
          variations.push(createFallbackVariation(marketplace, category, tone, price, deliveryTime, warrantyPeriod));
        }

        return json(200, { variations, riskClaims, audit });
      },
    },
  },
});

// Helper function to create a fallback variation for a marketplace
function createFallbackVariation(
  marketplace: string,
  category: string,
  tone: string,
  price: number | undefined,
  deliveryTime: string,
  warrantyPeriod: string
): AdVariation {
  const isGG = marketplace.toLowerCase().includes("ggmax");
  const isMercadoLivre = marketplace.toLowerCase().includes("mercado livre");
  const isEneba = marketplace.toLowerCase().includes("eneba");
  const isInstagram = marketplace.toLowerCase().includes("instagram");

  const faq = [
    { q: "Como é feita a entrega?", a: `Tudo é entregue diretamente pelo chat seguro do ${marketplace} em até ${deliveryTime}.` },
    { q: "O que cobre a garantia?", a: `Garantimos o funcionamento correto do item no momento do primeiro acesso dentro dos ${warrantyPeriod}.` },
  ];

  const postPurchaseSteps = [
    "1. Confirme o pagamento na plataforma.",
    "2. Abra a aba 'Meus Pedidos' e entre no chat direto.",
    "3. Siga o guia recebido e avalie nosso atendimento com 5 estrelas!"
  ];

  const forWho = "Compradores que buscam um item revisado, sem enrolação e com suporte transparente.";
  const notForWho = "Pessoas que pretendem compartilhar credenciais com terceiros ou violar as regras da plataforma.";

  const fullDescription = `✅ PRODUTO VERIFICADO E PRONTO PARA USO

Adquira com total segurança através da intermediação da plataforma.

⚡ **Diferenciais da Loja:**
• Entrega estimada em: ${deliveryTime}
• Período de suporte/garantia: ${warrantyPeriod}
• Instruções claras de primeiro acesso fornecidas logo após a compra

📋 **O que você recebe:**
• Acesso completo ao item/serviço contratado
• Manual passo a passo para configuração segura

🛡️ **Política de Suporte & Garantia:**
Oferecemos cobertura de ${warrantyPeriod} contra qualquer divergência na entrega inicial.

❓ **Perguntas Frequentes (FAQ):**
${faq.map((f) => `• ${f.q}\n  ${f.a}`).join("\n")}

🚀 **Passo a Passo Pós-Compra:**
${postPurchaseSteps.join("\n")}

🎯 **Para quem é:**
${forWho}

⚠️ **Para quem NÃO é:**
${notForWho}`;

  return {
    marketplace,
    titles: [
      `🔥 ${category.toUpperCase()} — Entrega ${deliveryTime} [LOJA OFICIAL]`,
      `⚡ ${category.toUpperCase()} Verificado · Suporte Completo · Garantia ${warrantyPeriod}`,
      `🟢 ${category.toUpperCase()} Premium — Pronta Entrega e Atendimento Rápido`,
    ],
    description: fullDescription,
    keywords: [category, "entrega rápida", "garantia", marketplace.toLowerCase(), "verificado"],
    strongPoints: [
      `Entrega rápida (${deliveryTime})`,
      `Garantia legal de ${warrantyPeriod}`,
      "Atendimento em horário estendido",
      "Passo a passo pós-compra incluso",
    ],
    faq,
    postPurchaseSteps,
    forWho,
    notForWho,
    complianceWarning: isGG
      ? "O GGMAX não permite trocas de contatos (Discord/WhatsApp) no chat do anúncio."
      : isMercadoLivre
        ? "Mantenha toda a conversa dentro do chat oficial do Mercado Livre."
        : isEneba
          ? "Siga as regras de comunicação da Eneba e não compartilhe contatos externos."
          : isInstagram
            ? "Não compartilhe contatos externos e siga as diretrizes da Meta para marketplaces."
            : "Mantenha toda a conversa dentro do chat oficial da plataforma.",
  };
}