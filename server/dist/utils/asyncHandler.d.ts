import { NextFunction, Request, Response } from "express";
type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function asyncHandler(handler: AsyncRoute): (req: Request, res: Response, next: NextFunction) => void;
export {};
