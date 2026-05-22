import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function createConversationRouter(controller: ConversationController) {
  const router = Router();

  router.post("/conversation/create", asyncHandler(controller.create));
  router.get("/conversation/:id", asyncHandler(controller.get));
  router.get("/conversations", asyncHandler(controller.list));
  router.delete("/conversation/:id", asyncHandler(controller.delete));

  return router;
}
