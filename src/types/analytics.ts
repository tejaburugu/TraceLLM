export interface ProviderLatencyMetric {
  provider: string;
  averageLatencyMs: number;
  requestCount: number;
}

export interface ModelLatencyMetric {
  model: string;
  averageLatencyMs: number;
  requestCount: number;
}

export interface LatencyResponse {
  totalRequests: number;
  conversationCount: number;
  averageLatencyMs: number;
  providerLatency: ProviderLatencyMetric[];
  modelLatency: ModelLatencyMetric[];
}

export interface ProviderErrorMetric {
  provider: string;
  requestCount: number;
  errorCount: number;
  errorRate: number;
}

export interface ErrorResponse {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  providerErrors: ProviderErrorMetric[];
  statusCounts: Array<{ status: string; count: number }>;
}

export interface UsageMetric {
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requestCount: number;
}

export interface ModelUsageMetric {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  requestCount: number;
}

export interface UsageResponse {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  providerUsage: UsageMetric[];
  modelUsage: ModelUsageMetric[];
}
