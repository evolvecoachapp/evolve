import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { WeeklyAnalytics } from "../../models/WeeklyAnalytics";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WeeklyVolumeChart } from "../WeeklyVolumeChart";

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

function renderChart(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WeeklyVolumeChart", () => {
  it("renders current and previous week volume comparison", () => {
    const { getByText, getByTestId } = renderChart(
      <WeeklyVolumeChart weekly={weekly} />,
    );

    expect(getByTestId("weekly-volume-chart")).toBeTruthy();
    expect(getByText("Weekly Volume")).toBeTruthy();
    expect(getByText("Current Week")).toBeTruthy();
    expect(getByText("Previous Week")).toBeTruthy();
    expect(getByText("1.1k kg")).toBeTruthy();
    expect(getByText("900 kg")).toBeTruthy();
  });

  it("shows a skeleton while loading", () => {
    const { getByTestId, queryByText } = renderChart(
      <WeeklyVolumeChart loading />,
    );

    expect(getByTestId("analytics-chart-skeleton")).toBeTruthy();
    expect(queryByText("Current Week")).toBeNull();
  });

  it("shows empty copy when weekly analytics are missing", () => {
    const { getByText } = renderChart(<WeeklyVolumeChart weekly={null} />);

    expect(getByText("No weekly volume yet.")).toBeTruthy();
  });
});
