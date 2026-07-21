import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ChatInput, CHAT_INPUT_SOFT_LIMIT } from "../ChatInput";

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

function renderInput(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ChatInput", () => {
  it("sends trimmed text and clears the field", () => {
    const onSend = jest.fn();
    const { getByLabelText } = renderInput(<ChatInput onSend={onSend} />);

    const input = getByLabelText("Message input");
    fireEvent.changeText(input, "  Hello coach  ");
    fireEvent.press(getByLabelText("Send message"));

    expect(onSend).toHaveBeenCalledWith("Hello coach");
    expect(input.props.value).toBe("");
  });

  it("disables send while loading", () => {
    const onSend = jest.fn();
    const { getByLabelText } = renderInput(
      <ChatInput onSend={onSend} loading />,
    );

    fireEvent.changeText(getByLabelText("Message input"), "Hello");
    fireEvent.press(getByLabelText("Send message"));

    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows a soft character counter near the limit", () => {
    const onSend = jest.fn();
    const nearLimit = "x".repeat(Math.floor(CHAT_INPUT_SOFT_LIMIT * 0.85));
    const { getByLabelText, getByText } = renderInput(
      <ChatInput onSend={onSend} />,
    );

    fireEvent.changeText(getByLabelText("Message input"), nearLimit);

    expect(
      getByText(`${nearLimit.length}/${CHAT_INPUT_SOFT_LIMIT}`),
    ).toBeTruthy();
  });
});
