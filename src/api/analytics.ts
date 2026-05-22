import { apiClient } from "./client";
import { ErrorResponse, LatencyResponse, UsageResponse } from "../types/analytics";

export async function fetchLatencyMetrics() {
  const { data } = await apiClient.get<LatencyResponse>("/analytics/latency");
  return data;
}

export async function fetchErrorMetrics() {
  const { data } = await apiClient.get<ErrorResponse>("/analytics/errors");
  return data;
}

export async function fetchUsageMetrics() {
  const { data } = await apiClient.get<UsageResponse>("/analytics/usage");
  return data;
}
