import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function createConversationRouter(controller) {
    const router = Router();
    router.post("/conversation/create", asyncHandler(controller.create));
    router.get("/conversation/:id", asyncHandler(controller.get));
    router.get("/conversations", asyncHandler(controller.list));
    router.delete("/conversation/:id", asyncHandler(controller.delete));
    return router;
}
//# sourceMappingURL=conversation.routes.js.map