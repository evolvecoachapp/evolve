import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import {
  EmptyConversation,
  EMPTY_CONVERSATION_EXAMPLES,
} from "../EmptyConversation";

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

describe("EmptyConversation", () => {
  it("renders example prompts and forwards presses", () => {
    const onExamplePress = jest.fn();
    const { getByText } = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ThemeProvider>
          <EmptyConversation onExamplePress={onExamplePress} />
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    expect(getByText("Start a conversation")).toBeTruthy();
    for (const example of EMPTY_CONVERSATION_EXAMPLES) {
      expect(getByText(example)).toBeTruthy();
    }

    fireEvent.press(getByText(EMPTY_CONVERSATION_EXAMPLES[0]));
    expect(onExamplePress).toHaveBeenCalledWith(EMPTY_CONVERSATION_EXAMPLES[0]);
  });
});
