import { z } from "zod";

export const inferenceLogSchema = z.object({
  timestamp: z.string().datetime({ offset: true }).optional(),
  sessionId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  provider: z.string().min(1),
  model: z.string().min(1),
  latencyMs: z.number().int().nonnegative().optional(),
  status: z.enum(["success", "error", "pending"]),
  errors: z
    .union([
      z.string().min(1),
      z.object({
        message: z.string().min(1),
        stack: z.string().optional()
      })
    ])
    .optional(),
  tokens: z
    .object({
      inputTokens: z.number().int().nonnegative().optional(),
      outputTokens: z.number().int().nonnegative().optional(),
      totalTokens: z.number().int().nonnegative().optional()
    })
    .optional(),
  inputPreview: z.string().optional(),
  outputPreview: z.string().optional()
});

export type InferenceLogPayload = z.infer<typeof inferenceLogSchema>;
