import { env } from "../config/env.js";
import { createId } from "../utils/ids.js";
import { HttpError } from "../utils/httpError.js";
import { nowIso } from "../utils/time.js";
export class ConversationService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async create(input) {
        const timestamp = nowIso();
        const conversation = {
            id: createId("conv"),
            sessionId: input.sessionId,
            title: input.title ?? "New conversation",
            createdAt: timestamp,
            updatedAt: timestamp,
            messages: [],
            metadata: {
                provider: input.provider ?? env.DEFAULT_PROVIDER,
                model: input.model ?? env.OPENAI_MODEL
            }
        };
        return this.repository.create(conversation);
    }
    async get(id, sessionId) {
        const conversation = await this.repository.findById(id);
        if (!conversation || (sessionId && conversation.sessionId !== sessionId)) {
            throw new HttpError(404, "Conversation not found.");
        }
        return conversation;
    }
    async list(sessionId) {
        return sessionId ? this.repository.findBySessionId(sessionId) : this.repository.list();
    }
    async delete(id, sessionId) {
        const deleted = await this.repository.delete(id, sessionId);
        if (!deleted) {
            throw new HttpError(404, "Conversation not found.");
        }
    }
    async appendMessages(conversationId, messages) {
        return this.repository.appendMessages(conversationId, messages);
    }
    async ensureConversation(input) {
        if (input.conversationId) {
            return this.get(input.conversationId, input.sessionId);
        }
        return this.create({
            sessionId: input.sessionId,
            title: this.titleFromMessage(input.firstMessage),
            provider: input.provider,
            model: input.model
        });
    }
    toContext(conversation) {
        const history = conversation.messages.slice(-env.MAX_HISTORY_MESSAGES);
        return [
            {
                role: "system",
                content: "You are a helpful, concise assistant. Use the conversation history to answer naturally."
            },
            ...history.map((message) => ({
                role: message.role,
                content: message.content
            }))
        ];
    }
    titleFromMessage(message) {
        const compact = message.replace(/\s+/g, " ").trim();
        return compact.length > 48 ? `${compact.slice(0, 48).trim()}...` : compact || "New conversation";
    }
}
//# sourceMappingURL=conversation.service.js.map