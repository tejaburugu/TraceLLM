export type ChatRole = "system" | "user" | "assistant";
export interface ChatMessage {
    id: string;
    conversationId: string;
    role: ChatRole;
    content: string;
    createdAt: string;
}
export interface Conversation {
    id: string;
    sessionId: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    messages: ChatMessage[];
    metadata: {
        provider: string;
        model: string;
    };
}
export interface ChatCompletionInput {
    conversationId?: string;
    sessionId: string;
    message: string;
    provider?: string;
    model?: string;
}
export interface ChatCompletionResult {
    conversation: Conversation;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    usage?: TokenUsage;
}
export interface TokenUsage {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
}
export interface ProviderChatMessage {
    role: ChatRole;
    content: string;
}
export interface ProviderResponse {
    content: string;
    model: string;
    provider: string;
    usage?: TokenUsage;
}
export interface ProviderStreamCallbacks {
    onToken: (token: string) => void;
    onComplete: (response: ProviderResponse) => void;
    onError?: (error: unknown) => void;
}
export interface LlmProvider {
    readonly name: string;
    complete(messages: ProviderChatMessage[], options: {
        model: string;
    }): Promise<ProviderResponse>;
    stream?(messages: ProviderChatMessage[], options: {
        model: string;
    }, callbacks: ProviderStreamCallbacks): Promise<void>;
}
