import { LlmProvider, ProviderChatMessage, ProviderStreamCallbacks } from "../types/chat.js";
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
    stream(messages: ProviderChatMessage[], options: {
        model: string;
    }, callbacks: ProviderStreamCallbacks): Promise<void>;
    private buildReply;
    private estimateTokens;
}
