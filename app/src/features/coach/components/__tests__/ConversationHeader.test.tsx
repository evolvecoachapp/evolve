import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ConversationHeader } from "../ConversationHeader";

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

describe("ConversationHeader", () => {
  it("renders coach identity, provider, model, and title", () => {
    const { getByText } = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ThemeProvider>
          <ConversationHeader
            coachName="EVOLVE Coach"
            providerName="Local Stub"
            model="Local Stub v1"
            online
            conversationTitle="Squat form"
          />
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    expect(getByText("EVOLVE Coach")).toBeTruthy();
    expect(getByText("Local Stub")).toBeTruthy();
    expect(getByText("Local Stub v1")).toBeTruthy();
    expect(getByText("Squat form")).toBeTruthy();
    expect(getByText("Online")).toBeTruthy();
  });
});
