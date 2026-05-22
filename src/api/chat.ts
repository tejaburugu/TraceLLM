import { apiClient, isApiUnavailable } from "./client";
import { createLocalMessage } from "./localPersistence";
import { buildLocalAssistantReply } from "../lib/text";
import { ChatMessage, ChatRequest, ChatStreamCallbacks } from "../types/chat";

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("The request was cancelled.", "AbortError"));
      },
      { once: true }
    );
  });
}

async function streamLocalReply(request: ChatRequest, callbacks: ChatStreamCallbacks) {
  const reply = buildLocalAssistantReply(request.message);
  const tokens = reply.match(/\S+\s*/g) ?? [reply];

  for (const token of tokens) {
    await wait(36, callbacks.signal);
    callbacks.onToken(token);
  }

  callbacks.onComplete(createLocalMessage(request.conversationId, "assistant", reply, "sent"));
}

export async function streamChatResponse(request: ChatRequest, callbacks: ChatStreamCallbacks) {
  try {
    const response = await fetch(`${apiClient.defaults.baseURL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: callbacks.signal
    });

    if (!response.ok || !response.body) {
      if (response.status === 404) {
        await streamLocalReply(request, callbacks);
        return;
      }
      throw new Error(`Chat stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    const flushEvent = (rawEvent: string) => {
      const lines = rawEvent.split(/\r?\n/);
      let event = "message";
      let data = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          event = line.slice(6).trim();
          continue;
        }
        if (line.startsWith("data:")) {
          data += (data ? "\n" : "") + line.slice(5).trim();
        }
      }

      if (!data) return;

      if (event === "token") {
        try {
          const parsed = JSON.parse(data);
          const token = typeof parsed === "string" ? parsed : parsed.token;
          if (typeof token === "string") {
            fullContent += token;
            callbacks.onToken(token);
          }
        } catch {
          fullContent += data;
          callbacks.onToken(data);
        }
      }

      if (event === "complete") {
        callbacks.onComplete(createLocalMessage(request.conversationId, "assistant", fullContent, "sent"));
      }

      if (event === "error") {
        const parsed = JSON.parse(data);
        throw new Error(parsed?.message ?? "Stream error");
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        flushEvent(rawEvent);
        boundary = buffer.indexOf("\n\n");
      }
    }

    if (buffer.trim()) {
      flushEvent(buffer);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (isApiUnavailable(error)) {
      await streamLocalReply(request, callbacks);
      return;
    }
    throw error;
  }
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatMessage> {
  try {
    const { data } = await apiClient.post<ChatMessage>("/chat", request);
    return data;
  } catch (error) {
    if (isApiUnavailable(error)) {
      return createLocalMessage(request.conversationId, "assistant", buildLocalAssistantReply(request.message), "sent");
    }
    throw error;
  }
}
