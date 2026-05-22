export function requestLogger(req, res, next) {
    const startedAt = performance.now();
    res.on("finish", () => {
        const latencyMs = Math.round(performance.now() - startedAt);
        console.info(JSON.stringify({
            requestId: req.requestId,
            sessionId: req.sessionId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            latencyMs
        }));
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map