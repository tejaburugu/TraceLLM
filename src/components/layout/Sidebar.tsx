import clsx from "clsx";
import { MessageSquare, PanelLeftClose, Plus, Square, X } from "lucide-react";
import { Conversation } from "../../types/chat";
import { formatConversationTime } from "../../lib/time";
import { IconButton } from "../ui/IconButton";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  open: boolean;
  isStreaming: boolean;
  onClose: () => void;
  onNewConversation: () => void;
  onResumeConversation: (conversationId: string) => void;
  onCancelConversation: () => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  open,
  isStreaming,
  onClose,
  onNewConversation,
  onResumeConversation,
  onCancelConversation
}: SidebarProps) {
  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-slate-950/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-80 max-w-[86vw] flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-slate-950 dark:text-slate-50">TraceLLM</div>
            <div className="text-xs text-slate-500">Conversations</div>
          </div>
          <div className="flex gap-2">
            <IconButton label="New conversation" onClick={onNewConversation}>
              <Plus size={18} />
            </IconButton>
            <IconButton label="Close sidebar" className="lg:hidden" onClick={onClose}>
              <X size={18} />
            </IconButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {conversations.map((conversation) => {
            const active = conversation.id === activeConversationId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onResumeConversation(conversation.id)}
                className={clsx(
                  "mb-2 flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition",
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50"
                    : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-900"
                )}
              >
                <MessageSquare className="mt-0.5 shrink-0" size={17} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{conversation.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {conversation.messages.length} messages · {formatConversationTime(conversation.updatedAt)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancelConversation}
            disabled={!activeConversationId}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            {isStreaming ? <Square size={15} /> : <PanelLeftClose size={15} />}
            {isStreaming ? "Cancel response" : "Cancel conversation"}
          </button>
        </div>
      </aside>
    </>
  );
}
