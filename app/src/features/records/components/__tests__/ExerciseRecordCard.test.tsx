import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ExerciseRecord } from "../../models/ExerciseRecord";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ExerciseRecordCard } from "../ExerciseRecordCard";

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

const exercises: readonly ExerciseRecord[] = Object.freeze([
  Object.freeze({
    exerciseId: "squat",
    exerciseName: "Back Squat",
    bestWeightKg: 140,
    bestEstimatedOneRM: Object.freeze({
      exerciseId: "squat",
      exerciseName: "Back Squat",
      weightKg: 140,
      reps: 3,
      estimatedKg: 154,
      achievedAt: "2026-07-21T12:00:00.000Z",
    }),
    bestSingleSetVolumeKg: 840,
    bestReps: 8,
    lastRecordAt: "2026-07-21T12:00:00.000Z",
  }),
]);

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ExerciseRecordCard", () => {
  it("renders exercise record rows", () => {
    const { getByText, getByTestId } = renderCard(
      <ExerciseRecordCard exercises={exercises} />,
    );

    expect(getByTestId("exercise-record-card")).toBeTruthy();
    expect(getByText("Back Squat")).toBeTruthy();
    expect(getByText(/Est\. 1RM/)).toBeTruthy();
    expect(getByText(/140 kg/)).toBeTruthy();
  });

  it("shows empty copy when there are no exercises", () => {
    const { getByText } = renderCard(
      <ExerciseRecordCard exercises={Object.freeze([])} />,
    );

    expect(getByText("No exercise records yet.")).toBeTruthy();
  });
});
