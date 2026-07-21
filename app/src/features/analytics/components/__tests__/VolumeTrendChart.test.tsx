import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WorkoutTrend } from "../../models/WorkoutTrend";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { VolumeTrendChart } from "../VolumeTrendChart";

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
  metric: "volume",
  points: Object.freeze([
    Object.freeze({ periodStart: "2026-07-06", value: 400 }),
    Object.freeze({ periodStart: "2026-07-13", value: 800 }),
  ]),
});

function renderChart(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("VolumeTrendChart", () => {
  it("renders the section title from precomputed trend data", () => {
    const { getByText, getByTestId } = renderChart(
      <VolumeTrendChart trend={trend} />,
    );

    expect(getByTestId("volume-trend-chart")).toBeTruthy();
    expect(getByText("Volume Trend")).toBeTruthy();
  });

  it("shows a skeleton while loading", () => {
    const { getByTestId, queryByText } = renderChart(
      <VolumeTrendChart loading />,
    );

    expect(getByTestId("analytics-chart-skeleton")).toBeTruthy();
    expect(queryByText("No volume data yet.")).toBeNull();
  });

  it("shows empty copy when there are no points", () => {
    const { getByText } = renderChart(
      <VolumeTrendChart
        trend={Object.freeze({ metric: "volume", points: Object.freeze([]) })}
      />,
    );

    expect(getByText("No volume data yet.")).toBeTruthy();
  });
});
