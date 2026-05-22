import { NextFunction, Request, Response } from "express";
import { createId } from "../utils/ids.js";

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
      requestId: string;
    }
  }
}

export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestSessionId = req.header("x-session-id") ?? req.body?.sessionId ?? req.query.sessionId;
  req.sessionId = typeof requestSessionId === "string" && requestSessionId.trim() ? requestSessionId.trim() : createId("session");
  req.requestId = createId("req");

  res.setHeader("x-session-id", req.sessionId);
  res.setHeader("x-request-id", req.requestId);

  next();
}
