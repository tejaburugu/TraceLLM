import { useState } from "react";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ChatPage } from "./pages/ChatPage";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const [view, setView] = useState<"chat" | "analytics">("chat");
  useTheme();

  return view === "analytics" ? (
    <AnalyticsPage onBack={() => setView("chat")} />
  ) : (
    <ChatPage onViewAnalytics={() => setView("analytics")} />
  );
}
