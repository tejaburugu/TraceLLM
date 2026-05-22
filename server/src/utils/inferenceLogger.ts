import axios, { AxiosInstance, AxiosResponse } from "axios";

export interface InferenceLogEntry {
  timestamp: string;
  sessionId: string;
  conversationId?: string;
  model?: string;
  provider?: string;
  latencyMs?: number;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
  inputPreview?: string;
  outputPreview?: string;
  status: "success" | "error" | "pending";
  errorMessage?: string;
  errorStack?: string;
}

export interface InferenceLoggerOptions {
  ingestUrl?: string;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export class InferenceLogger {
  private readonly client: AxiosInstance;
  private readonly ingestUrl: string;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly timeoutMs: number;
  private entry: InferenceLogEntry | null = null;

  constructor(options: InferenceLoggerOptions = {}) {
    this.ingestUrl = options.ingestUrl ?? "/logs/ingest";
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 500;
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.client = axios.create({ timeout: this.timeoutMs });
  }

  beforeRequest(sessionId: string, conversationId?: string, inputPreview?: string) {
    this.entry = {
      timestamp: new Date().toISOString(),
      sessionId,
      conversationId,
      inputPreview,
      status: "pending"
    };
  }

  afterResponse(responseData: {
    model?: string;
    provider?: string;
    output?: string;
    input?: string;
    conversationId?: string;
    latencyMs: number;
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  }) {
    if (!this.entry) {
      return;
    }

    this.entry = {
      ...this.entry,
      model: responseData.model,
      provider: responseData.provider,
      conversationId: responseData.conversationId ?? this.entry.conversationId,
      latencyMs: responseData.latencyMs,
      tokens: {
        input: responseData.usage?.inputTokens,
        output: responseData.usage?.outputTokens,
        total: responseData.usage?.totalTokens
      },
      outputPreview: responseData.output,
      inputPreview: responseData.input ?? this.entry.inputPreview,
      status: "success"
    };

    void this.sendLog();
  }

  logError(error: unknown, statusText?: string) {
    if (!this.entry) {
      return;
    }

    const errorMessage = this.extractErrorMessage(error, statusText);
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.entry = {
      ...this.entry,
      status: "error",
      errorMessage,
      errorStack
    };

    void this.sendLog();
  }

  async sendLog(): Promise<void> {
    if (!this.entry) {
      return;
    }

    const payload = { ...this.entry };
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        await this.client.post(this.ingestUrl, payload, {
          headers: { "Content-Type": "application/json" }
        });
        return;
      } catch (error) {
        attempt += 1;
        if (attempt > this.maxRetries) {
          throw error;
        }
        await this.delay(this.retryDelayMs);
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private extractErrorMessage(error: unknown, statusText?: string) {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? error.message ?? statusText ?? "Axios request failed.";
    }
    return statusText ?? "Unknown error";
  }
}

export interface GenerateResponseOptions {
  model: string;
  provider: string;
  conversationId?: string;
  prompt: string;
  sessionId: string;
  requestFn: () => Promise<{
    content: string;
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  }>;
}

export async function generateResponse(options: GenerateResponseOptions) {
  const logger = new InferenceLogger();
  logger.beforeRequest(options.sessionId, options.conversationId, options.prompt);

  const start = Date.now();

  try {
    const result = await options.requestFn();
    const latencyMs = Date.now() - start;

    logger.afterResponse({
      model: options.model,
      provider: options.provider,
      output: result.content,
      input: options.prompt,
      conversationId: options.conversationId,
      latencyMs,
      usage: result.usage
    });

    return result;
  } catch (error) {
    const latencyMs = Date.now() - start;
    logger.afterResponse({
      model: options.model,
      provider: options.provider,
      output: undefined,
      input: options.prompt,
      conversationId: options.conversationId,
      latencyMs,
      usage: undefined
    });
    logger.logError(error, "LLM request failed");
    throw error;
  }
}
