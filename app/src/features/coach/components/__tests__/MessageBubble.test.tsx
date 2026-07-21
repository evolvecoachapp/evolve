import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { MessageBubble } from "../MessageBubble";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderBubble(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("MessageBubble", () => {
  it("renders an assistant message", () => {
    const { getByText } = renderBubble(
      <MessageBubble
        role="assistant"
        content="Train legs today."
        status="sent"
        createdAt="2026-07-22T12:00:00.000Z"
      />,
    );

    expect(getByText("Train legs today.")).toBeTruthy();
  });

  it("renders a user message", () => {
    const { getByText } = renderBubble(
      <MessageBubble
        role="user"
        content="How should I squat?"
        status="sent"
        createdAt="2026-07-22T12:00:00.000Z"
      />,
    );

    expect(getByText("How should I squat?")).toBeTruthy();
  });

  it("shows retry for failed messages", () => {
    const onRetry = jest.fn();
    const { getByLabelText, getByText } = renderBubble(
      <MessageBubble
        role="user"
        content="Retry me"
        status="failed"
        createdAt="2026-07-22T12:00:00.000Z"
        onRetry={onRetry}
      />,
    );

    expect(getByText("Couldn’t send")).toBeTruthy();
    fireEvent.press(getByLabelText("Retry message"));
    expect(onRetry).toHaveBeenCalled();
  });
});
