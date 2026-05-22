import { useMemo, useRef } from "react";
import { MessageSquareText } from "lucide-react";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { Conversation } from "../../types/chat";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  conversation: Conversation | null;
}

export function MessageList({ conversation }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageKey = useMemo(
    () => conversation?.messages.map((message) => `${message.id}:${message.content.length}:${message.status}`).join("|"),
    [conversation?.messages]
  );

  useAutoScroll(scrollRef, lastMessageKey);

  if (!conversation || conversation.messages.length === 0) {
    return (
      <div ref={scrollRef} className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-6">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-soft">
            <MessageSquareText size={28} />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-slate-50">TraceLLM Chat</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Start a conversation and your history will stay available in the sidebar. Responses stream in real time and can be cancelled while running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl pb-6">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
