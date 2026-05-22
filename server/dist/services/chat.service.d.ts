import { ChatCompletionInput, ChatCompletionResult } from "../types/chat.js";
import { ConversationService } from "./conversation.service.js";
import { ProviderRegistryService } from "./providerRegistry.service.js";
export declare class ChatService {
    private readonly conversations;
    private readonly providers;
    constructor(conversations: ConversationService, providers: ProviderRegistryService);
    complete(input: ChatCompletionInput): Promise<ChatCompletionResult>;
}
