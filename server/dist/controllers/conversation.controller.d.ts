import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service.js";
export declare class ConversationController {
    private readonly conversations;
    constructor(conversations: ConversationService);
    create: (req: Request, res: Response) => Promise<void>;
    get: (req: Request, res: Response) => Promise<void>;
    list: (req: Request, res: Response) => Promise<void>;
    delete: (req: Request, res: Response) => Promise<void>;
}
