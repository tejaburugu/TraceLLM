import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart2, CircleDot, Waveform } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { fetchErrorMetrics, fetchLatencyMetrics, fetchUsageMetrics } from "../api/analytics";
import { ErrorResponse, LatencyResponse, UsageResponse } from "../types/analytics";

const CHART_COLORS = ["#22c55e", "#0ea5e9", "#f97316", "#ef4444", "#8b5cf6"];

function statCard(title: string, value: string, subtitle: string) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-4 text-3xl font-semibold text-slate-950 dark:text-slate-50">{value}</div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

export function AnalyticsPage({ onBack }: { onBack: () => void }) {
  const [latency, setLatency] = useState<LatencyResponse | null>(null);
  const [errors, setErrors] = useState<ErrorResponse | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLatencyMetrics(), fetchErrorMetrics(), fetchUsageMetrics()])
      .then(([latencyData, errorData, usageData]) => {
        setLatency(latencyData);
        setErrors(errorData);
        setUsage(usageData);
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load analytics.");
      })
      .finally(() => setLoading(false));
  }, []);

  const providerUsagePie = useMemo(() => usage?.providerUsage.map((entry) => ({ name: entry.provider, value: entry.totalTokens })) ?? [], [usage]);
  const errorsByProvider = useMemo(() => errors?.providerErrors ?? [], [errors]);
  const latencyByProvider = useMemo(() => latency?.providerLatency ?? [], [latency]);
  const modelUsage = useMemo(() => usage?.modelUsage ?? [], [usage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !latency || !errors || !usage) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">
          <ArrowLeft size={18} /> Back to chat
        </button>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h1 className="text-2xl font-semibold">Analytics unavailable</h1>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{error ?? "No data available."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Analytics dashboard</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Realtime metrics from your inference log events.</p>
          </div>
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
            <ArrowLeft size={18} /> Back to chat
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCard("Avg latency", `${Math.round(latency.averageLatencyMs)} ms`, "Average response time across all requests.")}
          {statCard("Throughput", `${latency.totalRequests}`, "Total inference requests received.")}
          {statCard("Error rate", `${(errors.errorRate * 100).toFixed(1)}%`, `${errors.totalErrors} failed requests.`)}
          {statCard("Total tokens", `${usage.totalTokens}`, "Summed input + output tokens.")}
          {statCard("Conversation count", `${latency.conversationCount}`, "Unique conversation sessions recorded.")}
          {statCard("Providers", `${usage.providerUsage.length}`, "Distinct providers used in logs.")}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center gap-3">
              <BarChart2 size={20} />
              <div>
                <p className="text-sm font-semibold">Latency by provider</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Average latency and request volume.</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyByProvider} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="provider" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [value, "ms"]} />
                  <Legend />
                  <Bar dataKey="averageLatencyMs" name="Avg latency" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center gap-3">
              <Waveform size={20} />
              <div>
                <p className="text-sm font-semibold">Usage by provider</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total token consumption per provider.</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={providerUsagePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} fill="#0ea5e9" label />
                  {providerUsagePie.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                  <Tooltip formatter={(value: number) => [`${value}`, "tokens"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center gap-3">
              <CircleDot size={20} />
              <div>
                <p className="text-sm font-semibold">Error rate by provider</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Compare failed requests across providers.</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={errorsByProvider} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="provider" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [value, "count"]} />
                  <Legend />
                  <Bar dataKey="errorCount" name="Errors" fill="#ef4444" />
                  <Bar dataKey="requestCount" name="Requests" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center gap-3">
              <Waveform size={20} />
              <div>
                <p className="text-sm font-semibold">Token usage by model</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aggregated input/output token counts.</p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={modelUsage} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="model" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inputTokens" stroke="#0ea5e9" name="Input tokens" />
                  <Line type="monotone" dataKey="outputTokens" stroke="#2563eb" name="Output tokens" />
                  <Line type="monotone" dataKey="totalTokens" stroke="#16a34a" name="Total tokens" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
