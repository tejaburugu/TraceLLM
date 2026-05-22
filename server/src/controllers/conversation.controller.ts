import { Request, Response } from "express";
import { ConversationService } from "../services/conversation.service.js";
import { requireStringParam } from "../utils/request.js";
import { createConversationSchema } from "../validators/chat.validators.js";

export class ConversationController {
  constructor(private readonly conversations: ConversationService) {}

  create = async (req: Request, res: Response) => {
    const body = createConversationSchema.parse(req.body);
    const conversation = await this.conversations.create({
      sessionId: body.sessionId ?? req.sessionId,
      title: body.title,
      provider: body.provider,
      model: body.model
    });

    res.status(201).json({
      sessionId: conversation.sessionId,
      conversation
    });
  };

  get = async (req: Request, res: Response) => {
    const conversationId = requireStringParam(req.params.id, "id");
    const conversation = await this.conversations.get(conversationId, req.sessionId);
    res.json({ sessionId: req.sessionId, conversation });
  };

  list = async (req: Request, res: Response) => {
    const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : req.sessionId;
    const conversations = await this.conversations.list(sessionId);
    res.json({ sessionId, conversations });
  };

  delete = async (req: Request, res: Response) => {
    const conversationId = requireStringParam(req.params.id, "id");
    await this.conversations.delete(conversationId, req.sessionId);
    res.status(204).send();
  };
}
