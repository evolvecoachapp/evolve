import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../theme/ThemeContext";
import { RuntimeFailureScreen } from "../RuntimeFailureScreen";

jest.mock("../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderScreen(onRetry: () => Promise<void> | void) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <RuntimeFailureScreen onRetry={onRetry} />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("RuntimeFailureScreen", () => {
  it("clearly indicates EVOLVE could not initialize the local session", async () => {
    const { getByText } = renderScreen(jest.fn());

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
  });

  it("never exposes raw exceptions, SQLite internals, or stack traces", async () => {
    const { getByText, queryByText } = renderScreen(jest.fn());

    await waitFor(() => expect(getByText("EVOLVE couldn't start")).toBeTruthy());
    expect(queryByText(/sqlite/i)).toBeNull();
    expect(queryByText(/error:/i)).toBeNull();
    expect(queryByText(/at\s+\w+\s+\(/)).toBeNull();
    expect(queryByText(/stack/i)).toBeNull();
  });

  it("calls the existing retrySession() handler when Retry is pressed", async () => {
    const onRetry = jest.fn().mockResolvedValue(undefined);
    const { getByText } = renderScreen(onRetry);

    await waitFor(() => expect(getByText("Retry")).toBeTruthy());
    await act(async () => {
      fireEvent.press(getByText("Retry"));
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not invoke retry again while a retry is already in flight", async () => {
    let resolveRetry: () => void = () => {};
    const onRetry = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRetry = resolve;
        }),
    );
    const { getByRole, getByText } = renderScreen(onRetry);

    await waitFor(() => expect(getByText("Retry")).toBeTruthy());
    const button = getByRole("button");
    fireEvent.press(button);
    fireEvent.press(button);

    expect(onRetry).toHaveBeenCalledTimes(1);

    resolveRetry();
    await waitFor(() => expect(getByText("Retry")).toBeTruthy());
  });
});
