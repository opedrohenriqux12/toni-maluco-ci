import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/generate-script")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          channel: string;
          tone: string;
          situation: string;
        };
        const { channel, tone, situation } = body;
        if (!channel || !tone || !situation) {
          return json(400, { error: "Canal, tom e situação são obrigatórios." });
        }

        // Check for OpenAI API key
        const apiKey = process.env["OPENAI_API_KEY"];
        if (apiKey) {
          const provider = createOpenAI({
            apiKey,
          });

          const prompt = `Você é um especialista em vendas e copywriting. Seu task é gerar um script de venda para o canal "${channel}", com tom "${tone}", para a situação "${situation}".

          O script deve ser:
          - Adequado ao canal especificado (WhatsApp, GGMAX Chat, Instagram DM)
          - Tom especificado (Amigável, Gamer, Formal, Urgente)
          - Para a situação especificada (Abordagem, Quebra de Objeção, Pós-venda)
          - Claro, persuasivo e adaptado ao contexto
          - Incluir uma saudação, desenvolvimento e encerramento apropriados
          - Ser um texto contínuo que pode ser usado diretamente na conversa

          Retorne apenas o script como uma string simples, sem nenhum texto adicional ou formatação especial.`;

          try {
            const result = await generateText({
              model: provider("gpt-4o-mini"),
              prompt,
            });

            const script = result.text.trim();
            if (!script) {
              throw new Error("Empty script generated");
            }

            return json(200, { script });
          } catch (error) {
            console.error("Error generating script with OpenAI:", error);
            // Fallback to simulation
          }
        }

        // Simulation fallback
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

        const script = [
          `=== Script para ${channelLabel} ===`,
          `Tom: ${toneLabel}`,
          `Situação: ${situationLabel}`,
          "",
          scriptContent,
          "",
          toneAdjustments[tone],
        ].join("\n");

        return json(200, { script });
      },
    },
  },
});