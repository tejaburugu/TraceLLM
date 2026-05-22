import OpenAI from "openai";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { LlmProvider, ProviderChatMessage, ProviderStreamCallbacks, ProviderResponse } from "../types/chat.js";

export class OpenAiProvider implements LlmProvider {
  readonly name = "openai";
  private readonly client?: OpenAI;

  constructor(apiKey = env.OPENAI_API_KEY) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    }
  }

  async complete(messages: ProviderChatMessage[], options: { model: string }) {
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

  async stream(
    messages: ProviderChatMessage[],
    options: { model: string },
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
    if (!this.client) {
      callbacks.onError?.(new HttpError(503, "OpenAI provider is not configured. Set OPENAI_API_KEY or use provider=local."));
      return;
    }

    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
      temperature: 0.7,
      stream: true
    }) as AsyncIterable<any>;

    let content = "";
    let finalModel = options.model;
    const usage = { inputTokens: undefined as number | undefined, outputTokens: undefined as number | undefined, totalTokens: undefined as number | undefined };

    try {
      for await (const event of response) {
        const delta = event.choices?.[0]?.delta?.content;
        if (delta) {
          content += delta;
          callbacks.onToken(delta);
        }
        if (event.model) {
          finalModel = event.model;
        }
        if (event.usage) {
          usage.inputTokens = event.usage.prompt_tokens ?? usage.inputTokens;
          usage.outputTokens = event.usage.completion_tokens ?? usage.outputTokens;
          usage.totalTokens = event.usage.total_tokens ?? usage.totalTokens;
        }
      }

      callbacks.onComplete({
        provider: this.name,
        model: finalModel,
        content,
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens
        }
      });
    } catch (error) {
      callbacks.onError?.(error);
      throw error;
    }
  }
}
