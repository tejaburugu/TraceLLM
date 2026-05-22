import OpenAI from "openai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
export class OpenAiProvider {
    name = "openai";
    client;
    constructor(apiKey = env.OPENAI_API_KEY) {
        if (apiKey) {
            this.client = new OpenAI({ apiKey });
        }
    }
    async complete(messages, options) {
        if (!this.client) {
            throw new HttpError(503, "OpenAI provider is not configured. Set OPENAI_API_KEY or use provider=local.");
        }
        const completion = await this.client.chat.completions.create({
            model: options.model,
            messages: messages.map((message) => ({
                role: message.role,
                content: message.content
            })),
            temperature: 0.7
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new HttpError(502, "OpenAI returned an empty assistant response.");
        }
        return {
            provider: this.name,
            model: completion.model,
            content,
            usage: {
                inputTokens: completion.usage?.prompt_tokens,
                outputTokens: completion.usage?.completion_tokens,
                totalTokens: completion.usage?.total_tokens
            }
        };
    }
}
//# sourceMappingURL=openai.provider.js.map