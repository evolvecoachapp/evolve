import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ErrorConversation } from "../ErrorConversation";

jest.mock("../../../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

describe("ErrorConversation", () => {
  it("renders a friendly message and retry action", () => {
    const onRetry = jest.fn();
    const { getByText, getByLabelText } = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ThemeProvider>
          <ErrorConversation
            message="We couldn’t reach Coach right now. Please try again."
            onRetry={onRetry}
          />
        </ThemeProvider>
      </SafeAreaProvider>,
    );

    expect(getByText("Couldn’t load Coach")).toBeTruthy();
    expect(
      getByText("We couldn’t reach Coach right now. Please try again."),
    ).toBeTruthy();

    fireEvent.press(getByLabelText("Retry conversation"));
    expect(onRetry).toHaveBeenCalled();
  });
});
