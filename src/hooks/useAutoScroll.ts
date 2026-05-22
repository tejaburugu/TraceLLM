import { RefObject, useEffect } from "react";

export function useAutoScroll<T extends HTMLElement>(ref: RefObject<T | null>, dependency: unknown) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth"
    });
  }, [dependency, ref]);
}
