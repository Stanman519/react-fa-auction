import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useEffect, useState } from "react";
import { ChatClient } from "./services/ChatUtils";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export RootState for convenience
export type { RootState, AppDispatch };

/**
 * Hook to detect mobile breakpoint (default 720px).
 * Returns true if viewport width is less than breakpoint.
 */
export function useIsMobile(breakpoint = 720): boolean {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Global unread message count across every Stream channel the user belongs to.
 * Stream tracks read/unread state server-side (client.user.total_unread_count) —
 * no app DB involved. Seeds from the connected client, then stays in sync via
 * events that carry an updated total_unread_count (new messages, marking read, etc).
 */
export function useUnreadMessageCount(): number {
  const chatConnected = useAppSelector((s) => s.chat.connected);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!chatConnected) {
      setCount(0);
      return;
    }
    const client = ChatClient.getInstance();
    const ownUser = client.user as { total_unread_count?: number } | undefined;
    setCount(ownUser?.total_unread_count ?? 0);

    const handler = (event: { total_unread_count?: number }) => {
      if (typeof event.total_unread_count === "number") {
        setCount(event.total_unread_count);
      }
    };
    client.on(handler);
    return () => client.off(handler);
  }, [chatConnected]);

  return count;
}
