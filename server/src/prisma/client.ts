import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required in environment for Prisma client initialization.");
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"]
});
