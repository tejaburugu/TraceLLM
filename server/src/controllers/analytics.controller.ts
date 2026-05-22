import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service.js";

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  latency = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.analyticsService.getLatency();
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  errors = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.analyticsService.getErrors();
      res.json(data);
    } catch (error) {
      next(error);
    }
  };

  usage = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.analyticsService.getUsage();
      res.json(data);
    } catch (error) {
      next(error);
    }
  };
}
