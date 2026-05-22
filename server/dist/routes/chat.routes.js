import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
export function createChatRouter(controller) {
    const router = Router();
    router.post("/chat", asyncHandler(controller.create));
    return router;
}
//# sourceMappingURL=chat.routes.js.map