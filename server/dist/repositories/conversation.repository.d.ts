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
export declare class InMemoryConversationRepository implements ConversationRepository {
    private readonly conversations;
    create(conversation: Conversation): Promise<Conversation>;
    findById(id: string): Promise<Conversation | null>;
    findBySessionId(sessionId: string): Promise<Conversation[]>;
    list(): Promise<Conversation[]>;
    delete(id: string, sessionId?: string): Promise<boolean>;
    appendMessages(conversationId: string, messages: ChatMessage[]): Promise<Conversation>;
    update(conversation: Conversation): Promise<Conversation>;
    private sort;
}
