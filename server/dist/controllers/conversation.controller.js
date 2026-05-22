import { requireStringParam } from "../utils/request.js";
import { createConversationSchema } from "../validators/chat.validators.js";
export class ConversationController {
    conversations;
    constructor(conversations) {
        this.conversations = conversations;
    }
    create = async (req, res) => {
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
    get = async (req, res) => {
        const conversationId = requireStringParam(req.params.id, "id");
        const conversation = await this.conversations.get(conversationId, req.sessionId);
        res.json({ sessionId: req.sessionId, conversation });
    };
    list = async (req, res) => {
        const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : req.sessionId;
        const conversations = await this.conversations.list(sessionId);
        res.json({ sessionId, conversations });
    };
    delete = async (req, res) => {
        const conversationId = requireStringParam(req.params.id, "id");
        await this.conversations.delete(conversationId, req.sessionId);
        res.status(204).send();
    };
}
//# sourceMappingURL=conversation.controller.js.map