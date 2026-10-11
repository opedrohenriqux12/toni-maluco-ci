import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai";
import type { Database, Json } from "@/integrations/supabase/types";
import { buildCouncilPrompt, type CouncilMode } from "@/lib/council-prompt";
import { advisors, type Advisor } from "@/lib/data";
import { generateUUID } from "@/lib/uuid";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Optional: try to get user from token if provided (for saving messages)
        const authHeader = request.headers.get("authorization");
        let userId: string | null = null;
        let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

        if (authHeader) {
          try {
            const token = authHeader.replace(/^Bearer\s+/i, "");
            const url = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
            const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
            if (url && key) {
              const potentialClient = createClient<Database>(url, key, {
                auth: { persistSession: false, autoRefreshToken: false },
                global: {
                  fetch: (input, init) => {
                    const h = new Headers(init?.headers);
                    h.set("apikey", key);
                    h.set("Authorization", `Bearer ${token}`);
                    return fetch(input, { ...init, headers: h });
                  },
                },
              });
              const { data: userData, error: userErr } = await potentialClient.auth.getUser(token);
              if (!userErr && userData.user) {
                userId = userData.user.id;
                supabaseClient = potentialClient;
              }
            }
          } catch (e) {
            console.error("Failed to create Supabase client:", e);
          }
        }

        const body = (await request.json()) as {
          messages?: UIMessage[];
          threadId?: string;
          mode?: CouncilMode;
          active?: string[];
        };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (!body.threadId || !messages.length) return json(400, { error: "Pedido inválido." });

        // Garante que a thread exista no Supabase se o usuário estiver autenticado (sem travar com 404)
        if (supabaseClient && userId) {
          try {
            await supabaseClient
              .from("council_threads")
              .upsert({ id: body.threadId, user_id: userId, title: "Nova conversa" }, { onConflict: "id" });
          } catch (err) {
            console.warn("Could not upsert thread in Supabase:", err);
          }
        }

        // Salva mensagem do usuário se estiver autenticado
        const last = messages[messages.length - 1]!;
        if (userId && supabaseClient && last.role === "user") {
          try {
            const lastText = last.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join(" ")
              .trim();

            await supabaseClient.from("council_messages").upsert(
              { thread_id: body.threadId, user_id: userId, sdk_id: last.id, role: "user", parts: last.parts as unknown as Json },
              { onConflict: "thread_id,sdk_id" },
            );

            const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
            const { data: threadData } = await supabaseClient.from("council_threads").select("title").eq("id", body.threadId).maybeSingle();
            if (threadData && threadData.title === "Nova conversa" && lastText) patch.title = lastText.slice(0, 60);
            await supabaseClient.from("council_threads").update(patch).eq("id", body.threadId);
          } catch (err) {
            console.error("Error saving user message to Supabase:", err);
          }
        }

        const nvidiaKey = process.env["NVIDIA_API_KEY"];
        const openRouterKey = process.env["OPENROUTER_API_KEY"];
        const openAiKey = process.env["OPENAI_API_KEY"];

        const lastMsg = messages[messages.length - 1];
        const lastTextMsg = lastMsg ? lastMsg.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") : "";
        const promptInstruction = buildCouncilPrompt(lastTextMsg, body.mode ?? "individual", body.active ?? []);

        // 1. Provedor NVIDIA NIM
        if (nvidiaKey) {
          try {
            const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
              signal: AbortSignal.timeout(8000),
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${nvidiaKey.trim()}`,
                "Accept": "application/json",
              },
              body: JSON.stringify({
                model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
                messages: [
                  { role: "system", content: promptInstruction },
                  ...messages.slice(-6).map((m) => ({
                    role: m.role === "assistant" ? "assistant" : "user",
                    content: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" "),
                  })),
                ],
                max_tokens: 4096,
                reasoning_budget: 1024,
                temperature: 0.6,
                top_p: 0.95,
                stream: false,
              }),
            });

            if (nvidiaRes.ok) {
              const nData = await nvidiaRes.json();
              const reply = nData.choices?.[0]?.message?.content || "[Sem resposta gerada pelo conselho]";
              const textId = generateUUID();

              const stream = createUIMessageStream({
                execute: async ({ writer }) => {
                  writer.write({ type: "start" });
                  const chunkSize = 25;
                  for (let i = 0; i < reply.length; i += chunkSize) {
                    const chunk = reply.slice(i, i + chunkSize);
                    writer.write({ type: "text-delta", id: textId, delta: chunk });
                    await new Promise((r) => setTimeout(r, 15));
                  }
                  writer.write({ type: "finish" });
                },
              });

              return createUIMessageStreamResponse({
                stream,
                headers: {
                  "X-Provider-Used": "nvidia-nim",
                },
              });
            }
          } catch (e) {
            console.error("NVIDIA NIM council error", e);
          }
        }

        // 2. Provedor OpenRouter (DeepSeek R1 / Grátis)
        if (openRouterKey) {
          const provider = createOpenAI({
            apiKey: openRouterKey,
            baseURL: "https://openrouter.ai/api/v1",
          });

          const result = streamText({
            model: provider("deepseek/deepseek-r1:free"),
            instructions: promptInstruction,
            messages: await convertToModelMessages(messages),
            abortSignal: request.signal,
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            headers: {
              "X-Provider-Used": "openrouter-free",
            },
          });
        }

        // 3. Provedor OpenAI
        if (openAiKey) {
          const provider = createOpenAI({
            apiKey: openAiKey,
          });

          const result = streamText({
            model: provider("gpt-4o-mini"),
            instructions: promptInstruction,
            messages: await convertToModelMessages(messages),
            abortSignal: request.signal,
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            headers: {
              "X-Provider-Used": "openai",
            },
          });
        }

        // 4. Simulação Rica com Personalidades Fiéis aos Conselheiros
        const mode = body.mode ?? "individual";
        const requestedActive = body.active && body.active.length > 0 ? body.active : ["lucia"];
        const activeAdvisors = advisors.filter((a) => requestedActive.includes(a.id));

        const defaultAdvisor = advisors.find((a) => a.id === "lucia") || advisors[0]!;
        let advisorsToShow: Advisor[] = activeAdvisors.length > 0 ? activeAdvisors : [defaultAdvisor];

        if (mode === "individual") {
          // No modo Individual, apenas o conselheiro selecionado fala
          advisorsToShow = [advisorsToShow[0] || defaultAdvisor];
        }

        let simulatedResponse = "";
        advisorsToShow.forEach((advisor) => {
          simulatedResponse += `### ${advisor.short} — ${advisor.area}\n`;
          simulatedResponse += `*${advisor.persona}*\n\n`;

          if (advisor.id === "lucia") {
            simulatedResponse += `Você disse: "${lastTextMsg}". Mas você realmente tem certeza disso ou é só o viés de confirmação e FOMO falando mais alto? 

Qual é a premissa oculta que você está ignorando deliberadamente? Se a plataforma mudar o algoritmo de reputação ou travar as contas amanhã de manhã, qual é o seu plano B de sobrevivência imediata? Se você não tiver essa resposta na ponta da língua, você está apenas apostando e fingindo que é estratégia.`;
          } else if (advisor.id === "helena") {
            simulatedResponse += `Vamos direto aos números de "${lastTextMsg}". Qual é a margem líquida real após a retenção da plataforma (12%) e a taxa de saque (2.5%)? 

Sem um cálculo rigoroso de fluxo de caixa e giro desse capital em no máximo 5 dias, esse movimento é financeiramente suicida. Dinheiro parado em produto digital é risco puro de desvalorização. Apresente a planilha detalhada antes de colocar um centavo a mais.`;
          } else if (advisor.id === "rafael") {
            simulatedResponse += `Analisando juridicamente a questão de "${lastTextMsg}": as diretrizes dos marketplaces e os Termos de Uso das publicadoras não deixam margem para dúvida sobre a vedação à transferência de propriedade. 

Além do risco de retenção preventiva de saldo pelo marketplace, você responde civilmente perante o Código de Defesa do Consumidor por vícios no produto. Recomendo alinhar estritamente os comunicados para não gerar expectativas não resguardadas em contrato.`;
          } else if (advisor.id === "bruno") {
            simulatedResponse += `Para resolver "${lastTextMsg}", corte toda a complexidade desnecessária. Não perca tempo montando microsserviço ou bot sofisticado agora. 

Um script simples em Node.js ou um webhook consumindo a API com fallback já resolve 95% do gargalo. Se você demorar mais de duas horas automatizando isso antes de validar as primeiras vendas no braço, você está procrastinando com código.`;
          } else if (advisor.id === "icaro") {
            simulatedResponse += `Qual é o tamanho amostral e a distribuição estatística que sustentam "${lastTextMsg}"? Uma dezena de vendas não constitui um padrão estocástico confiável. 

Qual é o desvio padrão dos preços concorrentes nas últimas semanas? Trabalhe com intervalos de confiança de 95% e métricas quantitativas reais em vez de confundir oscilação aleatória de curto prazo com tendência de mercado.`;
          } else if (advisor.id === "marina") {
            simulatedResponse += `O comprador de produto digital toma decisão em menos de 3 segundos com base em clareza e credibilidade. Para posicionar "${lastTextMsg}", o título precisa destacar o benefício direto (ex: "Entrega Automática 24/7 • Acesso Imediato • Suporte Vitalício"). 

Adicione selos visuais na descrição, quebre objeções com um FAQ enxuto e utilize prova social com capturas reais de clientes satisfeitos. Deseja que eu elabore uma copy completa de conversão para essa oferta?`;
          } else if (advisor.id === "ze") {
            simulatedResponse += `Amigo, escuta quem já viu de tudo nessa praça: essa conversa de "${lastTextMsg}" tem cara de golpe que já vi acontecer dezenas de vezes. Fornecedor entrega o primeiro lote bonitinho e no terceiro desaparece com o saldo todo. 

Exija gravação de tela de quem compra, não libere credenciais antes da confirmação do intermediador e jamais mantenha estoque concentrado num lugar só. Cautela é o que mantém a gente vivo aqui.`;
          } else {
            simulatedResponse += `Analisando criticamente "${lastTextMsg}". Pese os prós e contras objetivamente antes de avançar.`;
          }

          simulatedResponse += "\n\n";
        });

        if (mode === "war") {
          simulatedResponse += `### Veredito do Conselho\n**Decisão:** TESTAR com lote reduzido e validação rigorosa de margem e segurança.\n**Próximo Passo:** Mapear o custo unitário e colher dados empíricos antes de escalar a operação.`;
        }

        // Stream padrão UIMessage SSE do AI SDK
        const textId = generateUUID();
        const stream = createUIMessageStream({
          execute: async ({ writer }) => {
            writer.write({ type: "start" });
            const chunkSize = 20;
            for (let i = 0; i < simulatedResponse.length; i += chunkSize) {
              const chunk = simulatedResponse.slice(i, i + chunkSize);
              writer.write({ type: "text-delta", id: textId, delta: chunk });
              await new Promise((r) => setTimeout(r, 20));
            }
            writer.write({ type: "finish" });
          },
        });

        return createUIMessageStreamResponse({
          stream,
          headers: {
            "X-Provider-Used": "conselho-offline-simulation",
          },
        });
      },
    },
  },
});