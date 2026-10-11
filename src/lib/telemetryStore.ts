export interface TokenUsageRecord {
  id: string;
  timestamp: string;
  provider: "nvidia-nim" | "openrouter" | "openai" | "simulation";
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimatedBrl: number;
  commandSnippet: string;
}

export interface TelemetrySummary {
  totalCalls: number;
  totalTokens: number;
  creditsUsedNvidia: number;
  creditsLimitNvidia: number;
  creditsRemainingNvidia: number;
  costTotalBrl: number;
  history: TokenUsageRecord[];
}

const STORAGE_KEY = "tonimaluco_ai_telemetry_v1";

export function getTelemetryData(): TelemetrySummary {
  if (typeof window === "undefined") {
    return getDefaultTelemetry();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Erro lendo telemetria", e);
  }

  const initial = getDefaultTelemetry();
  saveTelemetryData(initial);
  return initial;
}

export function saveTelemetryData(data: TelemetrySummary): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export function recordAiCall(params: {
  provider: "nvidia-nim" | "openrouter" | "openai" | "simulation";
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  commandSnippet: string;
}): TelemetrySummary {
  const current = getTelemetryData();

  // Cálculo de crédito e custo:
  // No NVIDIA NIM, 1 chamada de chat com 30B consome aproximadamente ~1 a ~2 créditos de avaliação
  const creditsConsumed = params.provider === "nvidia-nim" 
    ? Math.max(1, Math.round(params.totalTokens / 500)) 
    : 0;

  // Custo estimado equivalente de mercado para comparação (R$ 0,00 se for free tier)
  const costBrl = (params.totalTokens / 1000) * 0.0015; // R$ 0,0015 por 1k tokens

  const newRecord: TokenUsageRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    provider: params.provider,
    model: params.model,
    promptTokens: params.promptTokens,
    completionTokens: params.completionTokens,
    totalTokens: params.totalTokens,
    costEstimatedBrl: costBrl,
    commandSnippet: params.commandSnippet.slice(0, 60),
  };

  const updated: TelemetrySummary = {
    totalCalls: current.totalCalls + 1,
    totalTokens: current.totalTokens + params.totalTokens,
    creditsUsedNvidia: Math.min(1000, current.creditsUsedNvidia + creditsConsumed),
    creditsLimitNvidia: 1000,
    creditsRemainingNvidia: Math.max(0, current.creditsRemainingNvidia - creditsConsumed),
    costTotalBrl: current.costTotalBrl + costBrl,
    history: [newRecord, ...current.history].slice(0, 50), // guarda últimas 50
  };

  saveTelemetryData(updated);
  return updated;
}

function getDefaultTelemetry(): TelemetrySummary {
  return {
    totalCalls: 3,
    totalTokens: 1420,
    creditsUsedNvidia: 3,
    creditsLimitNvidia: 1000,
    creditsRemainingNvidia: 997,
    costTotalBrl: 0.00,
    history: [
      {
        id: "init-1",
        timestamp: new Date().toISOString(),
        provider: "nvidia-nim",
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        promptTokens: 420,
        completionTokens: 85,
        totalTokens: 505,
        costEstimatedBrl: 0.00,
        commandSnippet: "Ola Claude Code! Responda quem e voce",
      },
    ],
  };
}
