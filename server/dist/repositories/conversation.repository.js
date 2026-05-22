export class InMemoryConversationRepository {
    conversations = new Map();
    async create(conversation) {
        this.conversations.set(conversation.id, conversation);
        return conversation;
    }
    async findById(id) {
        return this.conversations.get(id) ?? null;
    }
    async findBySessionId(sessionId) {
        return this.sort([...this.conversations.values()].filter((conversation) => conversation.sessionId === sessionId));
    }
    async list() {
        return this.sort([...this.conversations.values()]);
    }
    async delete(id, sessionId) {
        const conversation = this.conversations.get(id);
        if (!conversation)
            return false;
        if (sessionId && conversation.sessionId !== sessionId)
            return false;
        return this.conversations.delete(id);
    }
    async appendMessages(conversationId, messages) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} was not found.`);
        }
        const updated = {
            ...conversation,
            updatedAt: new Date().toISOString(),
            messages: [...conversation.messages, ...messages]
        };
        this.conversations.set(conversationId, updated);
        return updated;
    }
    async update(conversation) {
        this.conversations.set(conversation.id, conversation);
        return conversation;
    }
    sort(conversations) {
        return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
}
//# sourceMappingURL=conversation.repository.js.map