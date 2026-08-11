import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../theme/ThemeContext";
import { MockLogger } from "../../infrastructure/logging";
// Spy on the originating module (not the multi-level barrel re-export) so the
// mocked `getLogger` is a writable/configurable property Jest can replace.
import * as loggerFactoryModule from "../../infrastructure/logging/application/LoggerFactory";
import { ErrorBoundary } from "../ErrorBoundary";

jest.mock("../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

const RAW_ERROR_MESSAGE = "SQLite handle 0x00 unreachable — internal boom";

function ThrowsOnRender(): React.ReactElement {
  throw new Error(RAW_ERROR_MESSAGE);
}

let shouldThrow = true;
function Flaky(): React.ReactElement {
  if (shouldThrow) {
    throw new Error(RAW_ERROR_MESSAGE);
  }
  return <Text>Recovered content</Text>;
}

function wrap(children: React.ReactNode) {
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}

describe("ErrorBoundary", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    shouldThrow = true;
    // React logs caught errors to console.error even when a boundary handles them; silence that noise.
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("renders children normally when no error occurs", () => {
    const { getByText } = render(
      wrap(
        <ErrorBoundary>
          <Text>All good</Text>
        </ErrorBoundary>,
      ),
    );

    expect(getByText("All good")).toBeTruthy();
  });

  it("catches a render exception and displays a safe fallback", () => {
    const { getByText, queryByText } = render(
      wrap(
        <ErrorBoundary>
          <ThrowsOnRender />
        </ErrorBoundary>,
      ),
    );

    expect(getByText("Something went wrong")).toBeTruthy();
    expect(queryByText(RAW_ERROR_MESSAGE)).toBeNull();
    expect(queryByText(/sqlite/i)).toBeNull();
    expect(queryByText(/at\s+\w+\s+\(/)).toBeNull();
  });

  it("logs the caught error through the existing logging abstraction", () => {
    const mockLogger = new MockLogger();
    const errorSpy = jest.spyOn(mockLogger, "error");
    jest.spyOn(loggerFactoryModule, "getLogger").mockReturnValue(mockLogger);

    render(
      wrap(
        <ErrorBoundary>
          <ThrowsOnRender />
        </ErrorBoundary>,
      ),
    );

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unexpected application error"),
      expect.objectContaining({ scope: "Application" }),
    );
  });

  it("recovers via the retry action once the underlying error is resolved", () => {
    const { getByText, queryByText } = render(
      wrap(
        <ErrorBoundary>
          <Flaky />
        </ErrorBoundary>,
      ),
    );

    expect(getByText("Something went wrong")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(getByText("Try again"));

    expect(getByText("Recovered content")).toBeTruthy();
    expect(queryByText("Something went wrong")).toBeNull();
  });
});
