import clsx from "clsx";
import { AlertCircle, Bot, User } from "lucide-react";
import { ChatMessage } from "../../types/chat";
import { TypingIndicator } from "./TypingIndicator";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isEmptyStreaming = message.status === "streaming" && message.content.length === 0;

  return (
    <div className={clsx("flex w-full gap-3 px-4 py-5 sm:px-6", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Bot size={18} />
        </div>
      )}
      <div
        className={clsx(
          "max-w-[min(780px,85%)] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:text-[15px]",
          isUser
            ? "rounded-br-md bg-emerald-600 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
          message.status === "error" && "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
          message.status === "cancelled" && "opacity-75"
        )}
      >
        {isEmptyStreaming ? <TypingIndicator /> : message.content}
        {message.status === "error" && (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-300">
            <AlertCircle size={14} />
            {message.error}
          </div>
        )}
        {message.status === "cancelled" && <div className="mt-2 text-xs text-slate-500">Cancelled</div>}
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-950">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
