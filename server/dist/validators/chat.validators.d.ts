import { z } from "zod";
export declare const providerSchema: z.ZodEnum<{
    openai: "openai";
    local: "local";
}>;
export declare const createConversationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodEnum<{
        openai: "openai";
        local: "local";
    }>>;
    model: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const chatSchema: z.ZodObject<{
    conversationId: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    provider: z.ZodOptional<z.ZodEnum<{
        openai: "openai";
        local: "local";
    }>>;
    model: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
