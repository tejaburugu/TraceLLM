import { env } from "../config/env.js";
import { LocalProvider } from "../providers/local.provider.js";
import { OpenAiProvider } from "../providers/openai.provider.js";
import { LlmProvider } from "../types/chat.js";
import { HttpError } from "../utils/httpError.js";

export class ProviderRegistryService {
  private readonly providers = new Map<string, LlmProvider>();

  constructor() {
    this.register(new LocalProvider());
    this.register(new OpenAiProvider());
  }

  register(provider: LlmProvider) {
    this.providers.set(provider.name, provider);
  }

  resolve(providerName?: string) {
    const resolvedName = providerName ?? env.DEFAULT_PROVIDER;
    const provider = this.providers.get(resolvedName);
    if (!provider) {
      throw new HttpError(400, `Unsupported provider: ${resolvedName}`);
    }
    return provider;
  }
}
