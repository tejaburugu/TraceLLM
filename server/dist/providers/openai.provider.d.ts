import { LlmProvider, ProviderChatMessage, ProviderStreamCallbacks } from "../types/chat.js";
export declare class OpenAiProvider implements LlmProvider {
    readonly name = "openai";
    private readonly client?;
    constructor(apiKey?: string | undefined);
    complete(messages: ProviderChatMessage[], options: {
        model: string;
    }): Promise<{
        provider: string;
        model: string;
        content: string;
        usage: {
            inputTokens: number | undefined;
            outputTokens: number | undefined;
            totalTokens: number | undefined;
        };
    }>;
    stream(messages: ProviderChatMessage[], options: {
        model: string;
    }, callbacks: ProviderStreamCallbacks): Promise<void>;
}
