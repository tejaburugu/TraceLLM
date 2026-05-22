import { nanoid } from "nanoid";
import { ChatMessage, Conversation } from "../types/chat";
import { nowIso } from "../lib/time";

const STORAGE_KEY = "tracellm.conversations.v1";

export function loadLocalConversations(): Conversation[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Conversation[];
    return parsed.map((conversation) => ({
      ...conversation,
      isActive: conversation.isActive ?? false,
      messages: conversation.messages ?? []
    }));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveLocalConversations(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function createLocalConversation(): Conversation {
  const timestamp = nowIso();
  return {
    id: nanoid(),
    title: "New conversation",
    createdAt: timestamp,
    updatedAt: timestamp,
    isActive: true,
    messages: []
  };
}

export function createLocalMessage(
  conversationId: string,
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"] = "sent"
): ChatMessage {
  const timestamp = nowIso();
  return {
    id: nanoid(),
    conversationId,
    role,
    content,
    status,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
