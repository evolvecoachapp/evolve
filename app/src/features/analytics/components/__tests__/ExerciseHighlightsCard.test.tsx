import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ExerciseAnalytics } from "../../models/ExerciseAnalytics";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { ExerciseHighlightsCard } from "../ExerciseHighlightsCard";

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

function createExercise(
  overrides: Partial<ExerciseAnalytics> &
    Pick<ExerciseAnalytics, "exerciseId" | "exerciseName">,
): ExerciseAnalytics {
  return Object.freeze({
    bestWeightKg: overrides.bestWeightKg ?? 100,
    bestVolumeKg: overrides.bestVolumeKg ?? 500,
    averageReps: overrides.averageReps ?? 8,
    sessionsPerformed: overrides.sessionsPerformed ?? 3,
    lastPerformedAt: overrides.lastPerformedAt ?? "2026-07-21T12:00:00.000Z",
    ...overrides,
  });
}

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ExerciseHighlightsCard", () => {
  it("renders provided exercise highlights without reordering", () => {
    const exercises = Object.freeze([
      createExercise({
        exerciseId: "squat",
        exerciseName: "Back Squat",
        sessionsPerformed: 5,
        bestVolumeKg: 1200,
      }),
      createExercise({
        exerciseId: "bench",
        exerciseName: "Bench Press",
        sessionsPerformed: 4,
        bestVolumeKg: 800,
      }),
    ]);

    const { getByText, getByTestId, toJSON } = renderCard(
      <ExerciseHighlightsCard exercises={exercises} />,
    );

    expect(getByTestId("exercise-highlights-card")).toBeTruthy();
    expect(getByText("Back Squat")).toBeTruthy();
    expect(getByText("Bench Press")).toBeTruthy();
    expect(getByText(/5 sessions/)).toBeTruthy();
    expect(getByText(/1\.2k kg/)).toBeTruthy();

    const serialized = JSON.stringify(toJSON());
    expect(serialized.indexOf("Back Squat")).toBeLessThan(
      serialized.indexOf("Bench Press"),
    );
  });

  it("limits display to the first five provided exercises", () => {
    const exercises = Object.freeze(
      Array.from({ length: 7 }, (_, index) =>
        createExercise({
          exerciseId: `ex-${index}`,
          exerciseName: `Exercise ${index + 1}`,
          sessionsPerformed: 10 - index,
        }),
      ),
    );

    const { getByText, queryByText } = renderCard(
      <ExerciseHighlightsCard exercises={exercises} />,
    );

    expect(getByText("Exercise 1")).toBeTruthy();
    expect(getByText("Exercise 5")).toBeTruthy();
    expect(queryByText("Exercise 6")).toBeNull();
    expect(queryByText("Exercise 7")).toBeNull();
  });
});
