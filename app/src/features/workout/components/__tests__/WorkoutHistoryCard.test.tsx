import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { CompletedWorkout } from "../../models/CompletedWorkout";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WorkoutHistoryCard } from "../WorkoutHistoryCard";

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
  id: "session:day:1",
  sessionId: "session:day:1",
  title: "Upper A",
  programName: "Hypertrophy Block",
  durationSeconds: 2700,
  completedExercises: 2,
  totalExercises: 3,
  completedSets: 8,
  skippedSets: 1,
  totalSets: 10,
  completionPercent: 90,
  estimatedVolumeKg: 1200,
  averageCompletedReps: 9.5,
  completedAt: "2026-07-21T10:45:30.000Z",
});

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutHistoryCard", () => {
  it("renders workout metrics and optional program name", () => {
    const { getByText } = renderCard(<WorkoutHistoryCard workout={workout} />);

    expect(getByText("Upper A")).toBeTruthy();
    expect(getByText("Hypertrophy Block")).toBeTruthy();
    expect(getByText("45 min")).toBeTruthy();
    expect(getByText("2 / 3")).toBeTruthy();
    expect(getByText("8")).toBeTruthy();
    expect(getByText("1.2k kg")).toBeTruthy();
  });

  it("omits program name when null", () => {
    const withoutProgram = Object.freeze({ ...workout, programName: null });
    const { queryByText } = renderCard(
      <WorkoutHistoryCard workout={withoutProgram} />,
    );

    expect(queryByText("Hypertrophy Block")).toBeNull();
  });

  it("invokes onPress with the workout", () => {
    const onPress = jest.fn();
    const { getByText } = renderCard(
      <WorkoutHistoryCard workout={workout} onPress={onPress} />,
    );

    fireEvent.press(getByText("Upper A"));
    expect(onPress).toHaveBeenCalledWith(workout);
  });
});
