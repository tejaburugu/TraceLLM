import { NextFunction, Request, Response } from "express";
import { LogsService } from "../services/logs.service.js";
import { InferenceLogPayload } from "../validators/logs.validators.js";

export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  async ingestLog(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as InferenceLogPayload;
      const createdLog = await this.logsService.createLog(payload);

      console.info(
        JSON.stringify({
          event: "inference.log.ingest",
          requestId: req.requestId,
          sessionId: req.sessionId,
          provider: payload.provider,
          model: payload.model,
          status: payload.status,
          latencyMs: payload.latencyMs
        })
      );

      return res.status(201).json({ id: createdLog.id, status: "created" });
    } catch (error) {
      next(error);
    }
  }
}
