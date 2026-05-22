import { create } from "zustand";
import { nanoid } from "nanoid";
import { cancelConversation as cancelConversationApi, createConversation, fetchConversations, persistLocalConversation } from "../api/conversations";
import { streamChatResponse } from "../api/chat";
import { createLocalConversation, createLocalMessage, saveLocalConversations } from "../api/localPersistence";
import { getConversationTitle } from "../lib/text";
import { nowIso } from "../lib/time";
import { ChatMessage, Conversation, MessageStatus } from "../types/chat";

type Theme = "light" | "dark";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isBootstrapping: boolean;
  isStreaming: boolean;
  streamError: string | null;
  theme: Theme;
  sidebarOpen: boolean;
  currentAbortController: AbortController | null;
  bootstrap: () => Promise<void>;
  newConversation: () => Promise<void>;
  resumeConversation: (conversationId: string) => void;
  cancelActiveConversation: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}

function sortConversations(conversations: Conversation[]) {
  return [...conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function getActiveConversation(state: ChatState) {
  return state.conversations.find((conversation) => conversation.id === state.activeConversationId) ?? null;
}

function persistAll(conversations: Conversation[]) {
  saveLocalConversations(conversations);
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  isBootstrapping: true,
  isStreaming: false,
  streamError: null,
  theme: (localStorage.getItem("tracellm.theme") as Theme | null) ?? "dark",
  sidebarOpen: false,
  currentAbortController: null,

  bootstrap: async () => {
    set({ isBootstrapping: true });
    const conversations = await fetchConversations();
    const initialConversations = conversations.length > 0 ? conversations : [createLocalConversation()];
    const active = initialConversations.find((conversation) => conversation.isActive) ?? initialConversations[0];
    const normalized = sortConversations(
      initialConversations.map((conversation) => ({
        ...conversation,
        isActive: conversation.id === active.id
      }))
    );
    persistAll(normalized);
    set({
      conversations: normalized,
      activeConversationId: active.id,
      isBootstrapping: false
    });
  },

  newConversation: async () => {
    const conversation = await createConversation();
    const conversations = sortConversations([
      { ...conversation, isActive: true },
      ...get().conversations.map((item) => ({ ...item, isActive: false }))
    ]);
    persistAll(conversations);
    set({ conversations, activeConversationId: conversation.id, streamError: null, sidebarOpen: false });
  },

  resumeConversation: (conversationId: string) => {
    const conversations = sortConversations(
      get().conversations.map((conversation) => ({
        ...conversation,
        isActive: conversation.id === conversationId
      }))
    );
    persistAll(conversations);
    set({ conversations, activeConversationId: conversationId, streamError: null, sidebarOpen: false });
  },

  cancelActiveConversation: async () => {
    const activeId = get().activeConversationId;
    if (!activeId) return;
    get().stopStreaming();
    await cancelConversationApi(activeId);
    const conversations = get().conversations.map((conversation) =>
      conversation.id === activeId ? { ...conversation, isActive: false } : conversation
    );
    persistAll(conversations);
    set({ conversations, streamError: null });
  },

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || get().isStreaming) return;

    let active = getActiveConversation(get());
    if (!active) {
      await get().newConversation();
      active = getActiveConversation(get());
    }
    if (!active) return;

    const timestamp = nowIso();
    const userMessage = createLocalMessage(active.id, "user", trimmed, "sent");
    const assistantMessage: ChatMessage = {
      id: nanoid(),
      conversationId: active.id,
      role: "assistant",
      content: "",
      status: "streaming",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const nextTitle = active.messages.length === 0 ? getConversationTitle(trimmed) : active.title;
    const abortController = new AbortController();

    set((state) => {
      const conversations = sortConversations(
        state.conversations.map((conversation) =>
          conversation.id === active!.id
            ? {
                ...conversation,
                title: nextTitle,
                updatedAt: timestamp,
                isActive: true,
                messages: [...conversation.messages, userMessage, assistantMessage]
              }
            : { ...conversation, isActive: false }
        )
      );
      persistAll(conversations);
      return {
        conversations,
        activeConversationId: active!.id,
        isStreaming: true,
        currentAbortController: abortController,
        streamError: null
      };
    });

    try {
      await streamChatResponse(
        {
          conversationId: active.id,
          message: trimmed,
          model: "gpt-4.1-mini",
          provider: "openai"
        },
        {
          signal: abortController.signal,
          onToken: (token) => {
            set((state) => {
              const conversations = state.conversations.map((conversation) =>
                conversation.id === active!.id
                  ? {
                      ...conversation,
                      updatedAt: nowIso(),
                      messages: conversation.messages.map((message) =>
                        message.id === assistantMessage.id
                          ? { ...message, content: message.content + token, updatedAt: nowIso() }
                          : message
                      )
                    }
                  : conversation
              );
              persistAll(conversations);
              return { conversations };
            });
          },
          onComplete: () => {
            set((state) => {
              const conversations = sortConversations(
                state.conversations.map((conversation) =>
                  conversation.id === active!.id
                    ? {
                        ...conversation,
                        updatedAt: nowIso(),
                        messages: conversation.messages.map((message) =>
                          message.id === assistantMessage.id ? { ...message, status: "sent", updatedAt: nowIso() } : message
                        )
                      }
                    : conversation
                )
              );
              const updated = conversations.find((conversation) => conversation.id === active!.id);
              if (updated) void persistLocalConversation(updated);
              persistAll(conversations);
              return { conversations };
            });
          }
        }
      );
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const errorMessage = isAbort ? "Response cancelled." : error instanceof Error ? error.message : "Unable to send message.";
      const status: MessageStatus = isAbort ? "cancelled" : "error";
      set((state) => {
        const conversations = state.conversations.map((conversation) =>
          conversation.id === active!.id
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.id === assistantMessage.id
                    ? {
                        ...message,
                        status,
                        error: errorMessage,
                        updatedAt: nowIso()
                      }
                    : message
                )
              }
            : conversation
        );
        persistAll(conversations);
        return { conversations, streamError: errorMessage };
      });
    } finally {
      set({ isStreaming: false, currentAbortController: null });
    }
  },

  stopStreaming: () => {
    get().currentAbortController?.abort();
    set({ currentAbortController: null, isStreaming: false });
  },

  toggleTheme: () => {
    const nextTheme: Theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("tracellm.theme", nextTheme);
    set({ theme: nextTheme });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open })
}));
