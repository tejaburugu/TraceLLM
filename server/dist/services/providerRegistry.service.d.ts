import { LlmProvider } from "../types/chat.js";
export declare class ProviderRegistryService {
    private readonly providers;
    constructor();
    register(provider: LlmProvider): void;
    resolve(providerName?: string): LlmProvider;
}
