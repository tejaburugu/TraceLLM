import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
export function notFoundHandler(req, _res, next) {
    next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
export function errorHandler(error, req, res, _next) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            error: {
                code: "VALIDATION_ERROR",
                message: "Request validation failed.",
                details: error.flatten()
            },
            requestId: req.requestId
        });
    }
    if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
            error: {
                code: "REQUEST_ERROR",
                message: error.message,
                details: error.details
            },
            requestId: req.requestId
        });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const isProduction = process.env.NODE_ENV === "production";
    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: isProduction ? "Unexpected server error." : message
        },
        requestId: req.requestId
    });
}
//# sourceMappingURL=errorHandler.js.map