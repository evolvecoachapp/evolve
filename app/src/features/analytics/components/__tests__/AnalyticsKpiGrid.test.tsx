import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WorkoutAnalytics } from "../../models/WorkoutAnalytics";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { AnalyticsKpiGrid } from "../AnalyticsKpiGrid";

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
  totalWorkouts: 8,
  totalVolumeKg: 3200,
  totalSets: 64,
  totalReps: 512,
  averageDurationSeconds: 2400,
  averageVolumeKg: 400,
});

function renderGrid(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("AnalyticsKpiGrid", () => {
  it("renders workouts, sets, reps, and volume KPIs", () => {
    const { getByText, getByTestId, getAllByTestId } = renderGrid(
      <AnalyticsKpiGrid workout={workout} />,
    );

    expect(getByTestId("analytics-kpi-grid")).toBeTruthy();
    expect(getAllByTestId("analytics-kpi-card")).toHaveLength(4);
    expect(getByText("Total Workouts")).toBeTruthy();
    expect(getByText("8")).toBeTruthy();
    expect(getByText("Total Sets")).toBeTruthy();
    expect(getByText("64")).toBeTruthy();
    expect(getByText("Total Reps")).toBeTruthy();
    expect(getByText("512")).toBeTruthy();
    expect(getByText("Total Volume")).toBeTruthy();
    expect(getByText("3.2k kg")).toBeTruthy();
  });
});
