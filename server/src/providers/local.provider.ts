import { LlmProvider, ProviderChatMessage, ProviderResponse, ProviderStreamCallbacks } from "../types/chat.js";

export class LocalProvider implements LlmProvider {
  readonly name = "local";

  async complete(messages: ProviderChatMessage[], options: { model: string }) {
    const reply = this.buildReply(messages);
    const inputText = messages.map((message) => message.content).join(" ");

    return {
      provider: this.name,
      model: options.model,
      content: reply,
      usage: {
        inputTokens: this.estimateTokens(inputText),
        outputTokens: this.estimateTokens(reply),
        totalTokens: this.estimateTokens(inputText) + this.estimateTokens(reply)
      }
    };
  }

  async stream(
    messages: ProviderChatMessage[],
    options: { model: string },
    callbacks: ProviderStreamCallbacks
  ): Promise<void> {
    const reply = this.buildReply(messages);
    const tokens = reply.match(/\S+\s*/g) ?? [reply];
    let accumulated = "";

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 25));
      accumulated += token;
      callbacks.onToken(token);
    }

    callbacks.onComplete({
      provider: this.name,
      model: options.model,
      content: accumulated,
      usage: {
        inputTokens: this.estimateTokens(messages.map((message) => message.content).join(" ")),
        outputTokens: this.estimateTokens(accumulated),
        totalTokens:
          this.estimateTokens(messages.map((message) => message.content).join(" ")) + this.estimateTokens(accumulated)
      }
    });
  }

  private buildReply(messages: ProviderChatMessage[]) {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
    const priorTurns = messages.filter((message) => message.role !== "system").length;

    return [
      `I received your message: "${lastUserMessage}".`,
      "",
      `This conversation currently has ${priorTurns} message${priorTurns === 1 ? "" : "s"} in context.`,
      "The provider interface is active, so switching to OpenAI only requires setting DEFAULT_PROVIDER=openai and OPENAI_API_KEY."
    ].join("\n");
  }

  private estimateTokens(text: string) {
    return Math.max(1, Math.ceil(text.length / 4));
  }
}
