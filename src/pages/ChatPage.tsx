import { useEffect, useMemo } from "react";
import { useChatStore } from "../state/chatStore";
import { ChatInput } from "../components/chat/ChatInput";
import { MessageList } from "../components/chat/MessageList";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { LoadingScreen } from "../components/ui/LoadingScreen";

export function ChatPage({ onViewAnalytics }: { onViewAnalytics: () => void }) {
  const {
    conversations,
    activeConversationId,
    bootstrap,
    newConversation,
    resumeConversation,
    cancelActiveConversation,
    sendMessage,
    stopStreaming,
    isBootstrapping,
    isStreaming,
    streamError,
    theme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen
  } = useChatStore();

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations]
  );

  if (isBootstrapping) return <LoadingScreen />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        open={sidebarOpen}
        isStreaming={isStreaming}
        onClose={() => setSidebarOpen(false)}
        onNewConversation={newConversation}
        onResumeConversation={resumeConversation}
        onCancelConversation={cancelActiveConversation}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={activeConversation?.title ?? "New conversation"}
          theme={theme}
          onOpenSidebar={() => setSidebarOpen(true)}
          onNewConversation={newConversation}
          onToggleTheme={toggleTheme}
          onViewAnalytics={onViewAnalytics}
        />
        {streamError && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            {streamError}
          </div>
        )}
        <MessageList conversation={activeConversation} />
        <ChatInput isStreaming={isStreaming} disabled={!activeConversation} onSend={sendMessage} onStop={stopStreaming} />
      </main>
    </div>
  );
}
