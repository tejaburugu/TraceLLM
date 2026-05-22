export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "sending" | "streaming" | "sent" | "error" | "cancelled";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  messages: ChatMessage[];
}

export interface ChatRequest {
  conversationId: string;
  message: string;
  model: string;
  provider: string;
}

export interface ChatStreamCallbacks {
  signal: AbortSignal;
  onToken: (token: string) => void;
  onComplete: (response: ChatMessage) => void;
}

export interface CreateConversationResponse {
  conversation: Conversation;
}
