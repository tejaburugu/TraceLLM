import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
}

const rateMap = new Map<string, { count: number; expiresAt: number }>();

export function rateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const maxRequests = options.maxRequests ?? 40;

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.sessionId || req.ip || req.header("x-forwarded-for") || "unknown";
    const now = Date.now();
    const entry = rateMap.get(key);

    if (!entry || entry.expiresAt <= now) {
      rateMap.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.expiresAt - now) / 1000);
      _res.setHeader("Retry-After", String(retryAfter));
      return next(new HttpError(429, "Rate limit exceeded. Please try again later.", { retryAfter }));
    }

    entry.count += 1;
    rateMap.set(key, entry);
    next();
  };
}
