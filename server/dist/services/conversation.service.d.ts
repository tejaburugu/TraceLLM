import { ConversationRepository } from "../repositories/conversation.repository.js";
import { ChatMessage, Conversation } from "../types/chat.js";
export declare class ConversationService {
    private readonly repository;
    constructor(repository: ConversationRepository);
    create(input: {
        sessionId: string;
        title?: string;
        provider?: string;
        model?: string;
    }): Promise<Conversation>;
    get(id: string, sessionId?: string): Promise<Conversation>;
    list(sessionId?: string): Promise<Conversation[]>;
    delete(id: string, sessionId?: string): Promise<void>;
    appendMessages(conversationId: string, messages: ChatMessage[]): Promise<Conversation>;
    ensureConversation(input: {
        conversationId?: string;
        sessionId: string;
        firstMessage: string;
        provider?: string;
        model?: string;
    }): Promise<Conversation>;
    toContext(conversation: Conversation): {
        role: import("../types/chat.js").ChatRole;
        content: string;
    }[];
    private titleFromMessage;
}
