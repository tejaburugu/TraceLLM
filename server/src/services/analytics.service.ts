import { prisma } from "../prisma/client.js";

export interface LatencyMetric {
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
  providerLatency: LatencyMetric[];
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

function safeNumber(value: number | null | undefined) {
  return value ?? 0;
}

export class AnalyticsService {
  async getLatency(): Promise<LatencyResponse> {
    const [totalRequests, conversationGroups, latencySummary, providerRows, modelRows] = await Promise.all([
      prisma.inferenceLog.count(),
      prisma.inferenceLog.groupBy({
        by: ["conversationId"],
        _count: { _all: true }
      }),
      prisma.inferenceLog.aggregate({
        _avg: { latencyMs: true },
        where: { latencyMs: { not: null } }
      }),
      prisma.inferenceLog.groupBy({
        by: ["provider"],
        _avg: { latencyMs: true },
        _count: { _all: true },
        where: { latencyMs: { not: null } }
      }),
      prisma.inferenceLog.groupBy({
        by: ["model"],
        _avg: { latencyMs: true },
        _count: { _all: true },
        where: { latencyMs: { not: null } }
      })
    ]);

    return {
      totalRequests,
      conversationCount: conversationGroups.length,
      averageLatencyMs: safeNumber(latencySummary._avg.latencyMs),
      providerLatency: providerRows.map((row : any) => ({
        provider: row.provider,
        averageLatencyMs: safeNumber(row._avg.latencyMs),
        requestCount: row._count._all
      })),
      modelLatency: modelRows.map((row : any) => ({
        model: row.model,
        averageLatencyMs: safeNumber(row._avg.latencyMs),
        requestCount: row._count._all
      }))
    };
  }

  async getErrors(): Promise<ErrorResponse> {
    const [totalRequests, totalErrors, statusCounts, providerTotals, providerErrorTotals] = await Promise.all([
      prisma.inferenceLog.count(),
      prisma.inferenceLog.count({ where: { status: "error" } }),
      prisma.inferenceLog.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.inferenceLog.groupBy({ by: ["provider"], _count: { _all: true } }),
      prisma.inferenceLog.groupBy({ by: ["provider"], where: { status: "error" }, _count: { _all: true } })
    ]);

    const providerErrors = providerTotals.map((totalRow : any) => {
      const errorRow = providerErrorTotals.find((row : any) => row.provider === totalRow.provider);
      const errorCount = errorRow?._count._all ?? 0;
      const requestCount = totalRow._count._all;
      return {
        provider: totalRow.provider,
        requestCount,
        errorCount,
        errorRate: requestCount > 0 ? errorCount / requestCount : 0
      };
    });

    return {
      totalRequests,
      totalErrors,
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      providerErrors,
      statusCounts: statusCounts.map((row : any) => ({ status: row.status, count: row._count._all }))
    };
  }

  async getUsage(): Promise<UsageResponse> {
    const [usageSummary, providerRows, modelRows] = await Promise.all([
      prisma.inferenceLog.aggregate({
        _sum: { inputTokens: true, outputTokens: true, totalTokens: true }
      }),
      prisma.inferenceLog.groupBy({
        by: ["provider"],
        _sum: { inputTokens: true, outputTokens: true, totalTokens: true },
        _count: { _all: true }
      }),
      prisma.inferenceLog.groupBy({
        by: ["model"],
        _sum: { inputTokens: true, outputTokens: true, totalTokens: true },
        _count: { _all: true }
      })
    ]);

    return {
      totalInputTokens: safeNumber(usageSummary._sum.inputTokens),
      totalOutputTokens: safeNumber(usageSummary._sum.outputTokens),
      totalTokens: safeNumber(usageSummary._sum.totalTokens),
      providerUsage: providerRows.map((row : any) => ({
        provider: row.provider,
        inputTokens: safeNumber(row._sum.inputTokens),
        outputTokens: safeNumber(row._sum.outputTokens),
        totalTokens: safeNumber(row._sum.totalTokens),
        requestCount: row._count._all
      })),
      modelUsage: modelRows.map((row : any) => ({
        model: row.model,
        inputTokens: safeNumber(row._sum.inputTokens),
        outputTokens: safeNumber(row._sum.outputTokens),
        totalTokens: safeNumber(row._sum.totalTokens),
        requestCount: row._count._all
      }))
    };
  }
}
