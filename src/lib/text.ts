export function getConversationTitle(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  if (!compact) return "New conversation";
  return compact.length > 42 ? `${compact.slice(0, 42).trim()}...` : compact;
}

export function buildLocalAssistantReply(input: string) {
  const trimmed = input.trim();
  const topic = trimmed.replace(/[?.!]+$/, "");

  return [
    `I understand: "${topic}".`,
    "Here is a practical way to approach it:",
    "",
    "1. Clarify the expected outcome.",
    "2. Break the work into the smallest useful steps.",
    "3. Validate each step with data, tests, or direct feedback.",
    "",
    "Because this app is running without a connected backend right now, this response is generated locally while preserving the same streaming and persistence behavior the API integration uses."
  ].join("\n");
}
