import { createFileRoute } from "@tanstack/react-router";
  import { createClient } from "@supabase/supabase-js";
  import { createOpenAI } from "@ai-sdk/openai";
  import { convertToModelMessages, streamText, type UIMessage } from "ai";
  import type { Database, Json } from "@/integrations/supabase/types";
  import { buildCouncilPrompt, type CouncilMode } from "@/lib/council-prompt";
  import { advisors } from "@/lib/data";
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
          const token = authHeader.replace(/^Bearer\s+/i, "");
          const url = process.env["SUPABASE_URL"]!;
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
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

        const body = (await request.json()) as {
          messages?: UIMessage[];
          threadId?: string;
          mode?: CouncilMode;
          active?: string[];
        };
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (!body.threadId || !messages.length) return json(400, { error: "Pedido inválido." });

        // Validate thread exists (optional: we could skip this and allow any threadId)
        if (supabaseClient) {
          const { data: thread, error: threadErr } = await supabaseClient
            .from("council_threads")
            .select("id, title")
            .eq("id", body.threadId)
            .maybeSingle();
          if (threadErr || !thread) return json(404, { error: "Conversa não encontrada." });
        }

        // Save user message if we have a user and supabase client
        const last = messages[messages.length - 1]!;
        if (userId && supabaseClient && last.role === "user") {
          const lastText = last.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join(" ")
            .trim();

          const { error } = await supabaseClient.from("council_messages").upsert(
            { thread_id: body.threadId, user_id: userId, sdk_id: last.id, role: "user", parts: last.parts as unknown as Json },
            { onConflict: "thread_id,sdk_id" },
          );
          if (error) {
            console.error("save user message", error);
            return json(500, { error: "Não foi possível salvar sua mensagem." });
          }
          const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
          if (supabaseClient) {
            const { data: threadData } = await supabaseClient.from("council_threads").select("title").eq("id", body.threadId).maybeSingle();
            if (threadData && threadData.title === "Nova conversa" && lastText) patch.title = lastText.slice(0, 60);
            await supabaseClient.from("council_threads").update(patch).eq("id", body.threadId);
          }
        }

        // Engine de Inteligência Artificial do Conselho:
        // 1. NVIDIA NIM (Nemotron 30B) se disponível
        // 2. OpenRouter (DeepSeek R1 / Grátis)
        // 3. OpenAI (se chave fornecida)
        // 4. Simulação rica local
        const nvidiaKey = process.env["NVIDIA_API_KEY"];
        const openRouterKey = process.env["OPENROUTER_API_KEY"];
        const openAiKey = process.env["OPENAI_API_KEY"];

        const lastMsg = messages[messages.length - 1];
        const lastTextMsg = lastMsg ? lastMsg.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") : "";
        const promptInstruction = buildCouncilPrompt(lastTextMsg, body.mode ?? "geral", body.active ?? []);

        // 1. NVIDIA NIM
        if (nvidiaKey) {
          try {
            const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
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

              const stream = new ReadableStream({
                async start(controller) {
                  const chunkSize = 25;
                  for (let i = 0; i < reply.length; i += chunkSize) {
                    const chunk = reply.slice(i, i + chunkSize);
                    const messageChunk = {
                      id: generateUUID(),
                      role: "assistant",
                      content: chunk,
                      parts: [{ type: "text", text: chunk }],
                    };
                    controller.enqueue(new TextEncoder().encode(JSON.stringify(messageChunk) + "\n"));
                    await new Promise((r) => setTimeout(r, 20));
                  }
                  controller.close();
                },
              });

              return new Response(stream, {
                headers: {
                  "Content-Type": "text/plain; charset=utf-8",
                  "X-Provider-Used": "nvidia-nim",
                },
              });
            }
          } catch (e) {
            console.error("NVIDIA NIM council error", e);
          }
        }

        // 2. OpenRouter (DeepSeek R1 / Free)
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
          });
        }

        // 3. OpenAI
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
          });
        }

        // 4. Simulação rica local
        const activeAdvisors = advisors.filter((a) => body.active?.includes(a.id) ?? false);
        let simulatedResponse = "";
          if (activeAdvisors.length === 0) {
            simulatedResponse = `Como um conselho simulado, recebi sua mensagem: "${lastTextMsg}". Sem conselheiros específicos selecionados, ofereço uma reflexão geral: considere o contexto, seus objetivos e os possíveis impactos de suas decisões.`;
          } else {
            simulatedResponse = `Conselho simulado reunido para analisar: "${lastTextMsg}".\n\n`;
            activeAdvisors.forEach((advisor) => {
              simulatedResponse += `- ${advisor.name} (${advisor.area}): `;
              // generic advice based on area
              const areaLower = advisor.area.toLowerCase();
              if (areaLower.includes("finance") || areaLower.includes("invest") || areaLower.includes("econ")) {
                simulatedResponse += "Avalie os riscos e retornos financeiros; não deixe a emoção guiar seus investimentos.\n";
              } else if (areaLower.includes("marketing") || areaLower.includes("sales") || areaLower.includes("venda")) {
                simulatedResponse += "Foque no valor para o cliente e na comunicação clara dos benefícios.\n";
              } else if (areaLower.includes("jurídico") || areaLower.includes("legal") || areaLower.includes("direito")) {
                simulatedResponse += "Verifique a conformidade com regulamentações e proteja seus direitos contratuais.\n";
              } else if (areaLower.includes("tecnologia") || areaLower.includes("ti") || areaLower.includes("tech")) {
                simulatedResponse += "Considere a escalabilidade, segurança e manutenibilidade da solução técnica.\n";
              } else {
                simulatedResponse += "Refletir sobre os prós e contras, buscando equilíbrio entre pragmatismo e visão de longo prazo.\n";
              }
            });
            simulatedResponse += `\nLembre-se: o conselho é uma ferramenta de reflexão, não uma decisão final.`;
          }

          // Create a readable stream that simulates streaming by sending the response in small chunks
          const stream = new ReadableStream({
            async start(controller) {
              // Split into chunks of ~20 characters for a typing effect
              const chunkSize = 20;
              for (let i = 0; i < simulatedResponse.length; i += chunkSize) {
                const chunk = simulatedResponse.slice(i, i + chunkSize);

                // Create a UIMessage chunk
                const messageChunk = {
                  id: generateUUID(),
                  role: "assistant",
                  content: chunk,
                  parts: [{ type: "text", text: chunk }]
                };

                // Encode as JSON lines format (similar to what AI SDK expects)
                const encoded = new TextEncoder().encode(JSON.stringify(messageChunk) + "\n");
                controller.enqueue(encoded);

                // Small delay to simulate typing
                await new Promise(resolve => setTimeout(resolve, 30));
              }

              // Signal end of stream
              controller.close();
            }
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
          });
      },
    },
  },
});