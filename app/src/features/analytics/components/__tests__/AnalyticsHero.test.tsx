import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WorkoutAnalytics } from "../../models/WorkoutAnalytics";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { AnalyticsHero } from "../AnalyticsHero";

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

const workout: WorkoutAnalytics = Object.freeze({
  totalWorkouts: 12,
  totalVolumeKg: 4200,
  totalSets: 96,
  totalReps: 840,
  averageDurationSeconds: 2700,
  averageVolumeKg: 350,
});

function renderHero(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("AnalyticsHero", () => {
  it("renders total workouts, volume, and average duration", () => {
    const { getByText, getByTestId } = renderHero(
      <AnalyticsHero workout={workout} />,
    );

    expect(getByTestId("analytics-hero")).toBeTruthy();
    expect(getByText("Total Workouts")).toBeTruthy();
    expect(getByText("12")).toBeTruthy();
    expect(getByText("Total Volume")).toBeTruthy();
    expect(getByText("4.2k kg")).toBeTruthy();
    expect(getByText("Avg Duration")).toBeTruthy();
    expect(getByText("45 min")).toBeTruthy();
  });
});
