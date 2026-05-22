export class LocalProvider {
    name = "local";
    async complete(messages, options) {
        const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
        const priorTurns = messages.filter((message) => message.role !== "system").length;
        const inputText = messages.map((message) => message.content).join(" ");
        const content = [
            `I received your message: "${lastUserMessage}".`,
            "",
            `This conversation currently has ${priorTurns} message${priorTurns === 1 ? "" : "s"} in context.`,
            "The provider interface is active, so switching to OpenAI only requires setting DEFAULT_PROVIDER=openai and OPENAI_API_KEY."
        ].join("\n");
        return {
            provider: this.name,
            model: options.model,
            content,
            usage: {
                inputTokens: this.estimateTokens(inputText),
                outputTokens: this.estimateTokens(content),
                totalTokens: this.estimateTokens(inputText) + this.estimateTokens(content)
            }
        };
    }
    estimateTokens(text) {
        return Math.max(1, Math.ceil(text.length / 4));
    }
}
//# sourceMappingURL=local.provider.js.map