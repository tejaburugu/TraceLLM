import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  DEFAULT_PROVIDER: z.enum(["openai", "local"]).default("local"),
  DATABASE_URL: z.string().url().optional(),
  MAX_HISTORY_MESSAGES: z.coerce.number().int().positive().default(30),
  REQUEST_BODY_LIMIT: z.string().default("1mb")
});

export const env = envSchema.parse(process.env);
