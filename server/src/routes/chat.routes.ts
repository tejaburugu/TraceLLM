import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createChatRouter(controller: ChatController) {
  const router = Router();

  router.post("/chat", asyncHandler(controller.create));
  router.post("/chat/stream", asyncHandler(controller.stream));

  return router;
}
