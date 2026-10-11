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
  openRouterDailyRequestsUsed: number;
  openRouterDailyLimit: number;
  openRouterRpmLimit: number;
  costTotalBrl: number;
  history: TokenUsageRecord[];
}

const STORAGE_KEY = "tonimaluco_ai_telemetry_real_v2";

export function getTelemetryData(): TelemetrySummary {
  if (typeof window === "undefined") {
    return getDefaultTelemetry();
  }

  try {
    // Limpa chave antiga se existir
    if (localStorage.getItem("tonimaluco_ai_telemetry_v1")) {
      localStorage.removeItem("tonimaluco_ai_telemetry_v1");
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultTelemetry(),
        ...parsed,
      };
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
  const creditsConsumedNvidia = params.provider === "nvidia-nim" 
    ? Math.max(1, Math.round(params.totalTokens / 500)) 
    : 0;

  const isOpRouter = params.provider === "openrouter";
  const openRouterReqs = isOpRouter ? current.openRouterDailyRequestsUsed + 1 : current.openRouterDailyRequestsUsed;

  // Custo estimado equivalente de mercado para comparação (R$ 0,00 se for free tier)
  const costBrl = params.provider === "openrouter" || params.provider === "nvidia-nim" 
    ? 0.00 
    : (params.totalTokens / 1000) * 0.0015;

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
    creditsUsedNvidia: Math.min(1000, current.creditsUsedNvidia + creditsConsumedNvidia),
    creditsLimitNvidia: 1000,
    creditsRemainingNvidia: Math.max(0, current.creditsRemainingNvidia - creditsConsumedNvidia),
    openRouterDailyRequestsUsed: openRouterReqs,
    openRouterDailyLimit: current.openRouterDailyLimit || 50,
    openRouterRpmLimit: current.openRouterRpmLimit || 20,
    costTotalBrl: current.costTotalBrl + costBrl,
    history: [newRecord, ...current.history].slice(0, 50),
  };

  saveTelemetryData(updated);
  return updated;
}

export function resetTelemetryData(): TelemetrySummary {
  const fresh: TelemetrySummary = {
    totalCalls: 0,
    totalTokens: 0,
    creditsUsedNvidia: 0,
    creditsLimitNvidia: 1000,
    creditsRemainingNvidia: 1000,
    openRouterDailyRequestsUsed: 0,
    openRouterDailyLimit: 50,
    openRouterRpmLimit: 20,
    costTotalBrl: 0.0,
    history: [],
  };
  saveTelemetryData(fresh);
  return fresh;
}

function getDefaultTelemetry(): TelemetrySummary {
  return {
    totalCalls: 0,
    totalTokens: 0,
    creditsUsedNvidia: 0,
    creditsLimitNvidia: 1000,
    creditsRemainingNvidia: 1000,
    openRouterDailyRequestsUsed: 0,
    openRouterDailyLimit: 50,
    openRouterRpmLimit: 20,
    costTotalBrl: 0.0,
    history: [],
  };
}
