import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WorkoutTrend } from "../../models/WorkoutTrend";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WorkoutFrequencyChart } from "../WorkoutFrequencyChart";

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

const trend: WorkoutTrend = Object.freeze({
  metric: "workout_frequency",
  points: Object.freeze([
    Object.freeze({ periodStart: "2026-07-06", value: 2 }),
    Object.freeze({ periodStart: "2026-07-13", value: 3 }),
  ]),
});

function renderChart(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutFrequencyChart", () => {
  it("renders the section title from precomputed frequency data", () => {
    const { getByText, getByTestId } = renderChart(
      <WorkoutFrequencyChart trend={trend} />,
    );

    expect(getByTestId("workout-frequency-chart")).toBeTruthy();
    expect(getByText("Workout Frequency")).toBeTruthy();
  });

  it("shows a skeleton while loading", () => {
    const { getByTestId, queryByText } = renderChart(
      <WorkoutFrequencyChart loading />,
    );

    expect(getByTestId("analytics-chart-skeleton")).toBeTruthy();
    expect(queryByText("No frequency data yet.")).toBeNull();
  });

  it("shows empty copy when there are no points", () => {
    const { getByText } = renderChart(
      <WorkoutFrequencyChart
        trend={Object.freeze({
          metric: "workout_frequency",
          points: Object.freeze([]),
        })}
      />,
    );

    expect(getByText("No frequency data yet.")).toBeTruthy();
  });
});
