import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WeeklyAnalytics } from "../../models/WeeklyAnalytics";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WeeklySummaryCard } from "../WeeklySummaryCard";

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

const weekly: WeeklyAnalytics = Object.freeze({
  currentWeekVolumeKg: 1100,
  previousWeekVolumeKg: 900,
  sessionsPerWeek: 2.5,
});

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WeeklySummaryCard", () => {
  it("renders current and previous week workouts and volume", () => {
    const { getByText, getByTestId } = renderCard(
      <WeeklySummaryCard
        weekly={weekly}
        currentWeekWorkouts={3}
        previousWeekWorkouts={2}
      />,
    );

    expect(getByTestId("weekly-summary-card")).toBeTruthy();
    expect(getByText("Current Week")).toBeTruthy();
    expect(getByText("Previous Week")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByText("1.1k kg")).toBeTruthy();
    expect(getByText("900 kg")).toBeTruthy();
  });
});
