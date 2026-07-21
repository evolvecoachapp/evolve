import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { RecordSummary } from "../../models/RecordSummary";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { LifetimeStatsCard } from "../LifetimeStatsCard";

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

const summary: RecordSummary = Object.freeze({
  totalLifetimeVolumeKg: 4200,
  totalLifetimeSessions: 12,
  exerciseCount: 4,
  lastRecordAt: "2026-07-21T12:00:00.000Z",
});

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("LifetimeStatsCard", () => {
  it("renders lifetime volume, sessions, and exercise count", () => {
    const { getByText, getByTestId } = renderCard(
      <LifetimeStatsCard summary={summary} />,
    );

    expect(getByTestId("lifetime-stats-card")).toBeTruthy();
    expect(getByText("Total Volume")).toBeTruthy();
    expect(getByText("4.2k kg")).toBeTruthy();
    expect(getByText("Sessions")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(getByText("Exercises")).toBeTruthy();
    expect(getByText("4")).toBeTruthy();
    expect(getByText("Last Record")).toBeTruthy();
  });
});
