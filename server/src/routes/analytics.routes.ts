import express from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createAnalyticsRouter(controller: AnalyticsController) {
  const router = express.Router();

  router.get("/latency", asyncHandler(controller.latency.bind(controller)));
  router.get("/errors", asyncHandler(controller.errors.bind(controller)));
  router.get("/usage", asyncHandler(controller.usage.bind(controller)));

  return router;
}
