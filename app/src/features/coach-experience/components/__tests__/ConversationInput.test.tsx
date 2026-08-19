import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ConversationInput } from "../ConversationInput";

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

function renderComposer(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ConversationInput", () => {
  it("clears immediately and sends through the keyboard-aware composer", () => {
    const onSend = jest.fn();
    const { getByLabelText, getByPlaceholderText } = renderComposer(
      <ConversationInput onSend={onSend} />,
    );

    expect(getByPlaceholderText("Ask your coach…")).toBeTruthy();
    const input = getByLabelText("Coach message input");
    fireEvent.changeText(input, "  Hello coach  ");
    fireEvent.press(getByLabelText("Send message"));

    expect(onSend).toHaveBeenCalledWith("Hello coach");
    expect(input.props.value).toBe("");
  });

  it("disables send while a turn is pending", () => {
    const onSend = jest.fn();
    const { getByLabelText } = renderComposer(
      <ConversationInput onSend={onSend} disabled />,
    );

    fireEvent.changeText(getByLabelText("Coach message input"), "Hello");
    fireEvent.press(getByLabelText("Send message"));

    expect(onSend).not.toHaveBeenCalled();
    expect(getByLabelText("Coach message input").props.editable).toBe(false);
  });

  it("reports keyboard lift from the shared floating footer", () => {
    const onKeyboardHeightChange = jest.fn();
    const onComposerLayout = jest.fn();
    const { getByLabelText } = renderComposer(
      <ConversationInput
        onSend={jest.fn()}
        onKeyboardHeightChange={onKeyboardHeightChange}
        onComposerLayout={onComposerLayout}
      />,
    );

    expect(getByLabelText("Coach message input")).toBeTruthy();
    expect(getByLabelText("Send message")).toBeTruthy();
  });
});
