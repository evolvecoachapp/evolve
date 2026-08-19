import { useEffect, useCallback, type RefObject } from "react";

export interface ScrollToLatestTarget {
  scrollToEnd: (options?: { animated?: boolean }) => void;
}

export interface UseCoachConversationScrollInput {
  readonly messageCount: number;
  readonly lastMessageId?: string;
  readonly lastMessageLength?: number;
  readonly typingVisible: boolean;
  readonly keyboardLift: number;
}

/** Keeps the latest conversation content in view as turns, typing, or keyboard change. */
export function useCoachConversationScroll(
  scrollRef: RefObject<ScrollToLatestTarget | null>,
  input: UseCoachConversationScrollInput,
): (animated?: boolean) => void {
  const scrollToLatest = useCallback((animated = true) => {
    scrollRef.current?.scrollToEnd({ animated });
  }, [scrollRef]);

  useEffect(() => {
    scrollToLatest(true);
  }, [
    input.messageCount,
    input.lastMessageId,
    input.lastMessageLength,
    input.typingVisible,
    input.keyboardLift,
    scrollToLatest,
  ]);

  return scrollToLatest;
}
