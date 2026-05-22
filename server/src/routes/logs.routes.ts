import express from "express";
import { LogsController } from "../controllers/logs.controller.js";
import { rateLimiter } from "../middleware/rateLimiter.js";
import { validateInferenceLog } from "../middleware/validateInferenceLog.js";

export function createLogsRouter(controller: LogsController) {
  const router = express.Router();

  router.post(
    "/ingest",
    rateLimiter({ windowMs: 60_000, maxRequests: 40 }),
    validateInferenceLog,
    controller.ingestLog.bind(controller)
  );

  return router;
}
