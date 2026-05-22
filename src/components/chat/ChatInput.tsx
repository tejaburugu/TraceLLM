import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { Pause, SendHorizontal } from "lucide-react";
import clsx from "clsx";

interface ChatInputProps {
  disabled?: boolean;
  isStreaming: boolean;
  onSend: (message: string) => void;
  onStop: () => void;
}

export function ChatInput({ disabled, isStreaming, onSend, onStop }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!value.trim() || disabled || isStreaming) return;
    onSend(value);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            event.currentTarget.style.height = "48px";
            event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 180)}px`;
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message TraceLLM"
          className="max-h-44 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-300"
            aria-label="Stop response"
            title="Stop response"
          >
            <Pause size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            className={clsx(
              "mb-1 inline-flex h-10 w-10 items-center justify-center rounded-xl transition",
              "bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
            )}
            aria-label="Send message"
            title="Send message"
          >
            <SendHorizontal size={18} />
          </button>
        )}
      </div>
    </form>
  );
}
