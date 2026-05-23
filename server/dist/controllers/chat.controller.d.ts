import { Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";
export declare class ChatController {
    private readonly chat;
    constructor(chat: ChatService);
    create: (req: Request, res: Response) => Promise<void>;
    stream: (req: Request, res: Response) => Promise<void>;
}
