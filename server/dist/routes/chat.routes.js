import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function createChatRouter(controller) {
    const router = Router();
    router.post("/chat", asyncHandler(controller.create));
    router.post("/chat/stream", asyncHandler(controller.stream));
    return router;
}
//# sourceMappingURL=chat.routes.js.map