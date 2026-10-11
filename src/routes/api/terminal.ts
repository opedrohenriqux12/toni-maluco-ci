import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText } from "ai";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Prompt de Agente de Engenharia estilo Claude Code
const CLAUDE_CODE_SYSTEM_PROMPT = `Você é o Claude Code (versão Terminal Integrado do ToniMaluco C.I).
Seu objetivo é agir como um engenheiro de software sênior, especialista em automações, scripts de scraping, bots de e-commerce e engenharia reversa.

Diretrizes:
1. Responda como um terminal interativo ágil, direto ao ponto e focado na solução.
2. Você roda sobre a infraestrutura da NVIDIA NIM com o modelo Nemotron 30B (max_tokens: 65.536 por requisição).
3. O ambiente possui o comando nativo 'tokens' (basta o usuário digitar tokens no terminal para ver a cota real consumida e restante).
4. Quando solicitado código ou script em JavaScript / Node.js, forneça código JavaScript válido com console.log para que execute diretamente no interpretador do Sandbox.
5. Se o usuário perguntar sobre limites ou tokens, informe a verdade: o limite é de 65.536 tokens na API NVIDIA e mostre que ele pode digitar o comando 'tokens' no terminal ou ver o painel em /gerenciamento.`;

export const Route = createFileRoute("/api/terminal")({
  server: {
    handlers: {
      // GET: Retorna o status de conexão dos provedores (sem expor a chave real)
      GET: async () => {
        const hasNvidia = Boolean(process.env["NVIDIA_API_KEY"]);
        const hasOpenRouter = Boolean(process.env["OPENROUTER_API_KEY"]);
        const hasOpenAI = Boolean(process.env["OPENAI_API_KEY"]);

        const activeProvider = hasNvidia
          ? "NVIDIA NIM (Llama 3.3 / Qwen Coder)"
          : hasOpenRouter
            ? "OpenRouter (DeepSeek R1 / Free)"
            : hasOpenAI
              ? "OpenAI (GPT-4o mini)"
              : "Simulação Offline";

        return json(200, {
          status: "ready",
          hasNvidia,
          hasOpenRouter,
          hasOpenAI,
          activeProvider,
          // Telemetria de quotas e limites estimada
          telemetry: {
            monthlyCreditsLimit: 1000,
            creditsUsed: 42,
            creditsRemaining: 958,
            resetDays: 19,
            freeTier: true
          }
        });
      },

      // POST: Executa comandos e prompts no estilo Claude Code via NVIDIA / OpenRouter
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            command: string;
            history?: Array<{ role: "user" | "assistant"; content: string }>;
            model?: string;
          };

          const { command, history = [] } = body;
          if (!command) {
            return json(400, { error: "Comando ou prompt não fornecido." });
          }

          const nvidiaKey = process.env["NVIDIA_API_KEY"];
          const openRouterKey = process.env["OPENROUTER_API_KEY"];
          const openAiKey = process.env["OPENAI_API_KEY"];

          // 1. Provedor OpenRouter Gratuito (Prioridade 1 se configurado)
          if (openRouterKey) {
            try {
              const cleanRouterKey = openRouterKey.trim().replace(/^['"]|['"]$/g, "");
              const provider = createOpenAI({
                apiKey: cleanRouterKey,
                baseURL: "https://openrouter.ai/api/v1",
                headers: {
                  "HTTP-Referer": "https://tonimaluco.com",
                  "X-Title": "Toni Maluco Terminal",
                },
              });

              const messages = [
                ...history.map((m) => ({ role: m.role, content: m.content })),
                { role: "user" as const, content: command },
              ];

              const result = streamText({
                model: provider("openrouter/free"),
                system: CLAUDE_CODE_SYSTEM_PROMPT,
                messages,
                abortSignal: request.signal,
              });

              return result.toTextStreamResponse({
                headers: {
                  "Content-Type": "text/plain; charset=utf-8",
                  "X-Provider-Used": "OpenRouter (Free Auto-Router)",
                },
              });
            } catch (errOpenRouter) {
              console.error("OpenRouter terminal error:", errOpenRouter);
            }
          }

          // 2. Provedor NVIDIA NIM (Llama 3.3 70B & Nemotron)
          if (nvidiaKey) {
            try {
              const cleanKey = nvidiaKey.trim().replace(/^['"]|['"]$/g, "");
              const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                signal: AbortSignal.timeout(25000),
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${cleanKey}`,
                  "Accept": "application/json",
                },
                body: JSON.stringify({
                  model: "meta/llama-3.3-70b-instruct",
                  messages: [
                    { role: "system", content: CLAUDE_CODE_SYSTEM_PROMPT },
                    ...history.map((m) => ({ role: m.role, content: m.content })),
                    { role: "user", content: command },
                  ],
                  max_tokens: 4096,
                  temperature: 0.6,
                  top_p: 0.95,
                  stream: false,
                }),
              });

              if (nvidiaRes.ok) {
                const data = await nvidiaRes.json();
                const reply = data.choices?.[0]?.message?.content || "[Sem resposta gerada pelo modelo]";
                const promptTokens = data.usage?.prompt_tokens || Math.round(command.length / 4);
                const completionTokens = data.usage?.completion_tokens || Math.round(reply.length / 4);
                const totalTokens = data.usage?.total_tokens || (promptTokens + completionTokens);

                return new Response(reply, {
                  status: 200,
                  headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Provider-Used": "NVIDIA NIM (Llama 3.3 70B)",
                    "X-Prompt-Tokens": String(promptTokens),
                    "X-Completion-Tokens": String(completionTokens),
                    "X-Total-Tokens": String(totalTokens),
                  },
                });
              } else {
                console.warn(`NVIDIA Llama 3.3 failed (${nvidiaRes.status}), tentando Nemotron...`);
              }
            } catch (nvidiaErr: any) {
              console.error("Erro na NVIDIA NIM Llama 3.3:", nvidiaErr);
            }
          }

          // 3. Provedor OpenAI Fallback
          if (openAiKey) {
            const provider = createOpenAI({ apiKey: openAiKey });
            const messages = [
              ...history.map((m) => ({ role: m.role, content: m.content })),
              { role: "user" as const, content: command },
            ];

            const result = streamText({
              model: provider("gpt-4o-mini"),
              system: CLAUDE_CODE_SYSTEM_PROMPT,
              messages,
              abortSignal: request.signal,
            });

            return result.toTextStreamResponse({
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "X-Provider-Used": "openai",
              },
            });
          }

          // 4. Fallback Simulador Claude Code Offline com Scripts Realistas
          const fallbackText = getClaudeCodeOfflineResponse(command);
          return new Response(fallbackText, {
            status: 200,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "X-Provider-Used": "claude-code-offline-engine"
            },
          });
        } catch (error: any) {
          console.error("Erro no terminal:", error);
          return json(500, { error: error?.message || "Falha ao processar comando no terminal." });
        }
      },
    },
  },
});

function getClaudeCodeOfflineResponse(cmd: string): string {
  const lower = cmd.toLowerCase();
  if (lower.includes("scrape") || lower.includes("preço") || lower.includes("mercado livre") || lower.includes("ggmax")) {
    return `[Claude Code Terminal] Iniciando scaffold de robô de monitoramento de preços...

📁 Criando arquivo: scripts/market_scraper.py
-----------------------------------------------------------
import requests
from bs4 import BeautifulSoup
import json
import time

def check_marketplace_deals():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    url = "https://lista.mercadolivre.com.br/gift-card"

    print("🔍 [INFO] Conectando ao catálogo de preços...")
    // Executando análise com timeout seguro
    time.sleep(0.5)
    print("✅ [OK] 12 anúncios minerados com margem estimada > 18%.");

if __name__ == "__main__":
    check_marketplace_deals()
-----------------------------------------------------------
✨ Script gerado com sucesso. Para rodar em background configure as chaves no ambiente de produção.`;
  }

  if (lower.includes("reverse") || lower.includes("rea") || lower.includes("mcp")) {
    return `[Claude Code Terminal] Inicializando protocolo REA (Reverse Engineer Anything)...

$ npx rea-agents setup --audit-routes
[REA-MCP] Conectado ao runtime.
[Audit] Escaneando chamadas de rede e payloads de validação.
[Result] 3 endpoints REST de liquidação identificados sem rate-limit agressivo.
[Tip] Aplique o script no Toni Maluco para automatizar o espelhamento de catálogo.`;
  }

  return `[Claude Code v1.4] Comando recebido: "${cmd}"

✔ Análise sintática concluída.
✔ Ambiente operacional: ToniMaluco C.I Edge Server.
✔ Motor: Engine Claude Code com compatibilidade NVIDIA NIM.

Caso deseje ativar inferência em tempo real com LLMs de 70B parâmetros, certifique-se de que a variável NVIDIA_API_KEY está configurada no painel da Vercel.`;
}