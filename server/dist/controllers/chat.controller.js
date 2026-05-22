import { chatSchema } from "../validators/chat.validators.js";
export class ChatController {
    chat;
    constructor(chat) {
        this.chat = chat;
    }
    create = async (req, res) => {
        const body = chatSchema.parse(req.body);
        const result = await this.chat.complete({
            conversationId: body.conversationId,
            sessionId: body.sessionId ?? req.sessionId,
            message: body.message,
            provider: body.provider,
            model: body.model
        });
        res.json({
            sessionId: result.conversation.sessionId,
            conversationId: result.conversation.id,
            message: result.assistantMessage,
            userMessage: result.userMessage,
            conversation: result.conversation,
            usage: result.usage
        });
    };
}
//# sourceMappingURL=chat.controller.js.map