import { ChartBar, Menu, Moon, Plus, Sun } from "lucide-react";
import { IconButton } from "../ui/IconButton";

interface TopBarProps {
  title: string;
  theme: "light" | "dark";
  onOpenSidebar: () => void;
  onNewConversation: () => void;
  onToggleTheme: () => void;
  onViewAnalytics: () => void;
}

export function TopBar({ title, theme, onOpenSidebar, onNewConversation, onToggleTheme, onViewAnalytics }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton label="Open sidebar" className="lg:hidden" onClick={onOpenSidebar}>
          <Menu size={18} />
        </IconButton>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
          <p className="text-xs text-slate-500">Streaming chat with persisted history</p>
        </div>
      </div>
      <div className="flex gap-2">
        <IconButton label="Analytics dashboard" onClick={onViewAnalytics}>
          <ChartBar size={18} />
        </IconButton>
        <IconButton label="New conversation" onClick={onNewConversation}>
          <Plus size={18} />
        </IconButton>
        <IconButton label="Toggle dark mode" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </div>
    </header>
  );
}
