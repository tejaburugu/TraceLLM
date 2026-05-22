import { ChatMessage, Conversation } from "../types/chat.js";

export interface ConversationRepository {
  create(conversation: Conversation): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findBySessionId(sessionId: string): Promise<Conversation[]>;
  list(): Promise<Conversation[]>;
  delete(id: string, sessionId?: string): Promise<boolean>;
  appendMessages(conversationId: string, messages: ChatMessage[]): Promise<Conversation>;
  update(conversation: Conversation): Promise<Conversation>;
}

export class InMemoryConversationRepository implements ConversationRepository {
  private readonly conversations = new Map<string, Conversation>();

  async create(conversation: Conversation) {
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async findById(id: string) {
    return this.conversations.get(id) ?? null;
  }

  async findBySessionId(sessionId: string) {
    return this.sort([...this.conversations.values()].filter((conversation) => conversation.sessionId === sessionId));
  }

  async list() {
    return this.sort([...this.conversations.values()]);
  }

  async delete(id: string, sessionId?: string) {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;
    if (sessionId && conversation.sessionId !== sessionId) return false;
    return this.conversations.delete(id);
  }

  async appendMessages(conversationId: string, messages: ChatMessage[]) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} was not found.`);
    }

    const updated: Conversation = {
      ...conversation,
      updatedAt: new Date().toISOString(),
      messages: [...conversation.messages, ...messages]
    };
    this.conversations.set(conversationId, updated);
    return updated;
  }

  async update(conversation: Conversation) {
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  private sort(conversations: Conversation[]) {
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}
