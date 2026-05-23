import { chatSchema } from "../validators/chat.validators.js";
function sendEvent(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${data}\n\n`);
}
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
    stream = async (req, res) => {
        const body = chatSchema.parse(req.body);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        let completed = false;
        try {
            await this.chat.stream({
                conversationId: body.conversationId,
                sessionId: body.sessionId ?? req.sessionId,
                message: body.message,
                provider: body.provider,
                model: body.model
            }, {
                onToken: (token) => sendEvent(res, "token", JSON.stringify({ token })),
                onComplete: (providerResponse) => {
                    sendEvent(res, "complete", JSON.stringify({
                        content: providerResponse.content,
                        model: providerResponse.model,
                        provider: providerResponse.provider,
                        usage: providerResponse.usage
                    }));
                    completed = true;
                    res.end();
                },
                onError: (error) => {
                    sendEvent(res, "error", JSON.stringify({ message: error instanceof Error ? error.message : "Stream error" }));
                    completed = true;
                    res.end();
                }
            });
            if (!completed) {
                res.end();
            }
        }
        catch (error) {
            if (!res.headersSent) {
                throw error;
            }
            if (!completed) {
                sendEvent(res, "error", JSON.stringify({ message: error instanceof Error ? error.message : "Unexpected stream failure" }));
                res.end();
            }
        }
    };
}
//# sourceMappingURL=chat.controller.js.map