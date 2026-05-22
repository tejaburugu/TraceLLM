import { NextFunction, Request, Response } from "express";
declare global {
    namespace Express {
        interface Request {
            sessionId: string;
            requestId: string;
        }
    }
}
export declare function sessionMiddleware(req: Request, res: Response, next: NextFunction): void;
