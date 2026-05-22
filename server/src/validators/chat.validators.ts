import { z } from "zod";

export const providerSchema = z.enum(["openai", "local"]);

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  sessionId: z.string().trim().min(1).max(160).optional(),
  provider: providerSchema.optional(),
  model: z.string().trim().min(1).max(120).optional()
});

export const chatSchema = z.object({
  conversationId: z.string().trim().min(1).max(160).optional(),
  sessionId: z.string().trim().min(1).max(160).optional(),
  message: z.string().trim().min(1).max(20000),
  provider: providerSchema.optional(),
  model: z.string().trim().min(1).max(120).optional()
});
