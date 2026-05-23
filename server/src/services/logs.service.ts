import { HttpError } from "../utils/httpError.js";
import { prisma } from "../prisma/client.js";
import { InferenceLogPayload } from "../validators/logs.validators.js";

function extractError(payload: InferenceLogPayload) {
  if (!payload.errors) {
    return { errorMessage: null, errorStack: null };
  }

  if (typeof payload.errors === "string") {
    return { errorMessage: payload.errors, errorStack: null };
  }

  return {
    errorMessage: payload.errors.message,
    errorStack: payload.errors.stack ?? null
  };
}

export class LogsService {
  async createLog(payload: InferenceLogPayload) {
    const { errorMessage, errorStack } = extractError(payload);
    const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();

    if (isNaN(timestamp.getTime())) {
      throw new HttpError(400, "Invalid timestamp format.");
    }

    return prisma.inferenceLog.create({
      data: {
        timestamp,
        sessionId: payload.sessionId,
        conversationId: payload.conversationId ?? null,
        provider: payload.provider,
        model: payload.model,
        latencyMs: payload.latencyMs ?? null,
        status: payload.status,
        error: errorMessage,
        inputPreview: payload.inputPreview ?? null,
        outputPreview: payload.outputPreview ?? null,
        inputTokens: payload.tokens?.inputTokens ?? null,
        outputTokens: payload.tokens?.outputTokens ?? null,
        totalTokens: payload.tokens?.totalTokens ?? null
      }
    });
  }
}
