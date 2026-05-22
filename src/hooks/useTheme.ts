import { useEffect } from "react";
import { useChatStore } from "../state/chatStore";

export function useTheme() {
  const theme = useChatStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
}
