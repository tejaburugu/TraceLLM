import { LlmProvider, ProviderChatMessage } from "../types/chat.js";
export declare class LocalProvider implements LlmProvider {
    readonly name = "local";
    complete(messages: ProviderChatMessage[], options: {
        model: string;
    }): Promise<{
        provider: string;
        model: string;
        content: string;
        usage: {
            inputTokens: number;
            outputTokens: number;
            totalTokens: number;
        };
    }>;
    private estimateTokens;
}
