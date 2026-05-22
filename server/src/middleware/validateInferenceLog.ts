import { NextFunction, Request, Response } from "express";
import { inferenceLogSchema } from "../validators/logs.validators.js";
import { HttpError } from "../utils/httpError.js";

export function validateInferenceLog(req: Request, _res: Response, next: NextFunction) {
  const parseResult = inferenceLogSchema.safeParse(req.body);

  if (!parseResult.success) {
    return next(parseResult.error);
  }

  req.body = parseResult.data;
  next();
}
