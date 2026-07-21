import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { CompletedWorkout } from "../../models/CompletedWorkout";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WorkoutMetricsGrid } from "../WorkoutMetricsGrid";

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

const workout: CompletedWorkout = Object.freeze({
  id: "session:1",
  sessionId: "session:1",
  title: "Upper A",
  programName: "Hypertrophy Block",
  durationSeconds: 2700,
  completedExercises: 2,
  totalExercises: 3,
  completedSets: 8,
  skippedSets: 1,
  totalSets: 10,
  completionPercent: 90,
  estimatedVolumeKg: 1500,
  averageCompletedReps: 9.5,
  completedAt: "2026-07-21T10:45:30.000Z",
  exercises: Object.freeze([]),
});

function renderGrid(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutMetricsGrid", () => {
  it("renders duration, volume, exercise count, and set metrics", () => {
    const { getByText, getByTestId } = renderGrid(
      <WorkoutMetricsGrid workout={workout} />,
    );

    expect(getByTestId("workout-metrics-grid")).toBeTruthy();
    expect(getByText("Duration")).toBeTruthy();
    expect(getByText("45 min")).toBeTruthy();
    expect(getByText("Volume")).toBeTruthy();
    expect(getByText("1.5k kg")).toBeTruthy();
    expect(getByText("Exercises")).toBeTruthy();
    expect(getByText("2 / 3")).toBeTruthy();
    expect(getByText("Completed sets")).toBeTruthy();
    expect(getByText("8")).toBeTruthy();
    expect(getByText("Skipped sets")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
  });
});
