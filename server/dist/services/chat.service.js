import { env } from "../config/env.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";
export class ChatService {
    conversations;
    providers;
    constructor(conversations, providers) {
        this.conversations = conversations;
        this.providers = providers;
    }
    async complete(input) {
        const conversation = await this.conversations.ensureConversation({
            conversationId: input.conversationId,
            sessionId: input.sessionId,
            firstMessage: input.message,
            provider: input.provider,
            model: input.model
        });
        const userMessage = {
            id: createId("msg"),
            conversationId: conversation.id,
            role: "user",
            content: input.message,
            createdAt: nowIso()
        };
        const providerName = input.provider ?? conversation.metadata.provider ?? env.DEFAULT_PROVIDER;
        const model = input.model ?? conversation.metadata.model ?? env.OPENAI_MODEL;
        const provider = this.providers.resolve(providerName);
        const context = [...this.conversations.toContext(conversation), { role: "user", content: input.message }];
        const providerResponse = await provider.complete(context, { model });
        const assistantMessage = {
            id: createId("msg"),
            conversationId: conversation.id,
            role: "assistant",
            content: providerResponse.content,
            createdAt: nowIso()
        };
        const updatedConversation = await this.conversations.appendMessages(conversation.id, [userMessage, assistantMessage]);
        return {
            conversation: {
                ...updatedConversation,
                metadata: {
                    provider: providerResponse.provider,
                    model: providerResponse.model
                }
            },
            userMessage,
            assistantMessage,
            usage: providerResponse.usage
        };
    }
    async stream(input, callbacks) {
        const conversation = await this.conversations.ensureConversation({
            conversationId: input.conversationId,
            sessionId: input.sessionId,
            firstMessage: input.message,
            provider: input.provider,
            model: input.model
        });
        const userMessage = {
            id: createId("msg"),
            conversationId: conversation.id,
            role: "user",
            content: input.message,
            createdAt: nowIso()
        };
        const providerName = input.provider ?? conversation.metadata.provider ?? env.DEFAULT_PROVIDER;
        const model = input.model ?? conversation.metadata.model ?? env.OPENAI_MODEL;
        const provider = this.providers.resolve(providerName);
        const context = [...this.conversations.toContext(conversation), { role: "user", content: input.message }];
        if (provider.stream) {
            await provider.stream(context, { model }, callbacks);
        }
        else {
            const providerResponse = await provider.complete(context, { model });
            callbacks.onComplete(providerResponse);
        }
    }
}
//# sourceMappingURL=chat.service.js.map