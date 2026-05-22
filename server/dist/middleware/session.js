import { createId } from "../utils/ids.js";
export function sessionMiddleware(req, res, next) {
    const requestSessionId = req.header("x-session-id") ?? req.body?.sessionId ?? req.query.sessionId;
    req.sessionId = typeof requestSessionId === "string" && requestSessionId.trim() ? requestSessionId.trim() : createId("session");
    req.requestId = createId("req");
    res.setHeader("x-session-id", req.sessionId);
    res.setHeader("x-request-id", req.requestId);
    next();
}
//# sourceMappingURL=session.js.map