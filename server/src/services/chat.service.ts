import { env } from "../config/env.js";
import { ChatCompletionInput, ChatCompletionResult, ProviderStreamCallbacks } from "../types/chat.js";
import { createId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";
import { ConversationService } from "./conversation.service.js";
import { ProviderRegistryService } from "./providerRegistry.service.js";

export class ChatService {
  constructor(
    private readonly conversations: ConversationService,
    private readonly providers: ProviderRegistryService
  ) {}

  async complete(input: ChatCompletionInput): Promise<ChatCompletionResult> {
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
      role: "user" as const,
      content: input.message,
      createdAt: nowIso()
    };

    const providerName = input.provider ?? conversation.metadata.provider ?? env.DEFAULT_PROVIDER;
    const model = input.model ?? conversation.metadata.model ?? env.OPENAI_MODEL;
    const provider = this.providers.resolve(providerName);
    const context = [...this.conversations.toContext(conversation), { role: "user" as const, content: input.message }];
    const providerResponse = await provider.complete(context, { model });

    const assistantMessage = {
      id: createId("msg"),
      conversationId: conversation.id,
      role: "assistant" as const,
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

  async stream(
    input: ChatCompletionInput,
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
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
      role: "user" as const,
      content: input.message,
      createdAt: nowIso()
    };

    const providerName = input.provider ?? conversation.metadata.provider ?? env.DEFAULT_PROVIDER;
    const model = input.model ?? conversation.metadata.model ?? env.OPENAI_MODEL;
    const provider = this.providers.resolve(providerName);
    const context = [...this.conversations.toContext(conversation), { role: "user" as const, content: input.message }];

    if (provider.stream) {
      await provider.stream(context, { model }, callbacks);
    } else {
      const providerResponse = await provider.complete(context, { model });
      callbacks.onComplete(providerResponse);
    }
  }
}
