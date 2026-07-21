import { render } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { CompletedWorkoutExercise } from "../../models/CompletedWorkout";
import { ThemeProvider } from "../../../../theme/ThemeContext";
import { WorkoutExerciseCard } from "../WorkoutExerciseCard";

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

const exercise: CompletedWorkoutExercise = Object.freeze({
  id: "ex:1",
  name: "Bench Press",
  order: 0,
  sets: Object.freeze([
    Object.freeze({
      id: "set:1",
      setNumber: 1,
      weightKg: 60,
      reps: 10,
    }),
    Object.freeze({
      id: "set:2",
      setNumber: 2,
      weightKg: 62.5,
      reps: 8,
    }),
  ]),
});

function renderCard(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutExerciseCard", () => {
  it("renders the exercise name and completed set rows with volume", () => {
    const { getByText, getByTestId } = renderCard(
      <WorkoutExerciseCard
        exercise={exercise}
        exerciseNumber={1}
        exerciseTotal={2}
      />,
    );

    expect(getByTestId("workout-exercise-card-ex:1")).toBeTruthy();
    expect(getByText("Exercise 1 of 2")).toBeTruthy();
    expect(getByText("Bench Press")).toBeTruthy();
    expect(getByText("#1")).toBeTruthy();
    expect(getByText("60 kg × 10 reps")).toBeTruthy();
    expect(getByText("600 kg")).toBeTruthy();
    expect(getByText("#2")).toBeTruthy();
    expect(getByText("62.5 kg × 8 reps")).toBeTruthy();
    expect(getByText("500 kg")).toBeTruthy();
  });

  it("shows an empty message when an exercise has no completed sets", () => {
    const emptyExercise: CompletedWorkoutExercise = Object.freeze({
      id: "ex:empty",
      name: "Row",
      order: 1,
      sets: Object.freeze([]),
    });

    const { getByText } = renderCard(
      <WorkoutExerciseCard
        exercise={emptyExercise}
        exerciseNumber={2}
        exerciseTotal={2}
      />,
    );

    expect(getByText("Row")).toBeTruthy();
    expect(getByText("No completed sets")).toBeTruthy();
  });
});
