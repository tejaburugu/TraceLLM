import { env } from "../config/env.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { ChatMessage, Conversation } from "../types/chat.js";
import { createId } from "../utils/ids.js";
import { HttpError } from "../utils/httpError.js";
import { nowIso } from "../utils/time.js";

export class ConversationService {
  constructor(private readonly repository: ConversationRepository) {}

  async create(input: { sessionId: string; title?: string; provider?: string; model?: string }) {
    const timestamp = nowIso();
    const conversation: Conversation = {
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

  async get(id: string, sessionId?: string) {
    const conversation = await this.repository.findById(id);
    if (!conversation || (sessionId && conversation.sessionId !== sessionId)) {
      throw new HttpError(404, "Conversation not found.");
    }
    return conversation;
  }

  async list(sessionId?: string) {
    return sessionId ? this.repository.findBySessionId(sessionId) : this.repository.list();
  }

  async delete(id: string, sessionId?: string) {
    const deleted = await this.repository.delete(id, sessionId);
    if (!deleted) {
      throw new HttpError(404, "Conversation not found.");
    }
  }

  async appendMessages(conversationId: string, messages: ChatMessage[]) {
    return this.repository.appendMessages(conversationId, messages);
  }

  async ensureConversation(input: { conversationId?: string; sessionId: string; firstMessage: string; provider?: string; model?: string }) {
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

  toContext(conversation: Conversation) {
    const history = conversation.messages.slice(-env.MAX_HISTORY_MESSAGES);
    return [
      {
        role: "system" as const,
        content: "You are a helpful, concise assistant. Use the conversation history to answer naturally."
      },
      ...history.map((message) => ({
        role: message.role,
        content: message.content
      }))
    ];
  }

  private titleFromMessage(message: string) {
    const compact = message.replace(/\s+/g, " ").trim();
    return compact.length > 48 ? `${compact.slice(0, 48).trim()}...` : compact || "New conversation";
  }
}
