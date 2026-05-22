import { apiClient, isApiUnavailable } from "./client";
import { createLocalConversation, loadLocalConversations, saveLocalConversations } from "./localPersistence";
import { Conversation, CreateConversationResponse } from "../types/chat";

export async function fetchConversations(): Promise<Conversation[]> {
  try {
    const { data } = await apiClient.get<Conversation[]>("/conversations");
    return data;
  } catch (error) {
    if (isApiUnavailable(error)) return loadLocalConversations();
    throw error;
  }
}

export async function createConversation(): Promise<Conversation> {
  try {
    const { data } = await apiClient.post<CreateConversationResponse>("/conversations");
    return data.conversation;
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    const conversations = loadLocalConversations().map((conversation) => ({ ...conversation, isActive: false }));
    const conversation = createLocalConversation();
    saveLocalConversations([conversation, ...conversations]);
    return conversation;
  }
}

export async function cancelConversation(conversationId: string): Promise<void> {
  try {
    await apiClient.patch(`/conversations/${conversationId}/cancel`);
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    const conversations = loadLocalConversations().map((conversation) =>
      conversation.id === conversationId ? { ...conversation, isActive: false } : conversation
    );
    saveLocalConversations(conversations);
  }
}

export async function persistLocalConversation(conversation: Conversation) {
  const conversations = loadLocalConversations();
  const next = conversations.some((item) => item.id === conversation.id)
    ? conversations.map((item) => (item.id === conversation.id ? conversation : item))
    : [conversation, ...conversations];
  saveLocalConversations(next);
}
