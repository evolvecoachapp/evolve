import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { TypingIndicator } from "../TypingIndicator";

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

describe("TypingIndicator", () => {
  it("exposes a typing accessibility label", () => {
    const { getByLabelText } = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ThemeProvider>
          <TypingIndicator />
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    expect(getByLabelText("Coach is typing")).toBeTruthy();
  });
});
