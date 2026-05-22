import { env } from "../config/env.js";
import { LocalProvider } from "../providers/local.provider.js";
import { OpenAiProvider } from "../providers/openai.provider.js";
import { HttpError } from "../utils/httpError.js";
export class ProviderRegistryService {
    providers = new Map();
    constructor() {
        this.register(new LocalProvider());
        this.register(new OpenAiProvider());
    }
    register(provider) {
        this.providers.set(provider.name, provider);
    }
    resolve(providerName) {
        const resolvedName = providerName ?? env.DEFAULT_PROVIDER;
        const provider = this.providers.get(resolvedName);
        if (!provider) {
            throw new HttpError(400, `Unsupported provider: ${resolvedName}`);
        }
        return provider;
    }
}
//# sourceMappingURL=providerRegistry.service.js.map