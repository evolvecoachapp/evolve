import { renderHook } from "@testing-library/react-native";
import { useRef } from "react";
import {
  useCoachConversationScroll,
  type ScrollToLatestTarget,
} from "../useCoachConversationScroll";

describe("useCoachConversationScroll", () => {
  it("scrolls to the end when messages, typing, or keyboard lift change", () => {
    const scrollToEnd = jest.fn();
    const target: ScrollToLatestTarget = { scrollToEnd };
    const { rerender } = renderHook(
      (
        input: {
          messageCount: number;
          lastMessageId: string | undefined;
          lastMessageLength: number;
          typingVisible: boolean;
          keyboardLift: number;
        },
      ) => {
        const ref = useRef(target);
        return useCoachConversationScroll(ref, input);
      },
      {
        initialProps: {
          messageCount: 0,
          lastMessageId: undefined as string | undefined,
          lastMessageLength: 0,
          typingVisible: false,
          keyboardLift: 0,
        },
      },
    );

    expect(scrollToEnd).toHaveBeenCalled();
    scrollToEnd.mockClear();

    rerender({
      messageCount: 1,
      lastMessageId: "pending:user:1",
      lastMessageLength: 12,
      typingVisible: true,
      keyboardLift: 0,
    });
    expect(scrollToEnd).toHaveBeenCalled();
    scrollToEnd.mockClear();

    rerender({
      messageCount: 2,
      lastMessageId: "coach-1",
      lastMessageLength: 240,
      typingVisible: false,
      keyboardLift: 0,
    });
    expect(scrollToEnd).toHaveBeenCalled();
    scrollToEnd.mockClear();

    rerender({
      messageCount: 2,
      lastMessageId: "coach-1",
      lastMessageLength: 240,
      typingVisible: false,
      keyboardLift: 280,
    });
    expect(scrollToEnd).toHaveBeenCalled();
  });
});
