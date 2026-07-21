import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { CompletedWorkout } from "../../features/workout/models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../features/workout/repository";
import { ThemeProvider } from "../../theme/ThemeContext";
import { WorkoutDetailScreen } from "../WorkoutDetailScreen";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock("../../theme/themeStorage", () => ({
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

function createWorkout(
  overrides: Partial<CompletedWorkout> & Pick<CompletedWorkout, "id" | "title" | "completedAt">,
): CompletedWorkout {
  return Object.freeze({
    sessionId: overrides.sessionId ?? overrides.id,
    programName: overrides.programName ?? "Hypertrophy Block",
    durationSeconds: overrides.durationSeconds ?? 2700,
    completedExercises: overrides.completedExercises ?? 2,
    totalExercises: overrides.totalExercises ?? 3,
    completedSets: overrides.completedSets ?? 8,
    skippedSets: overrides.skippedSets ?? 1,
    totalSets: overrides.totalSets ?? 10,
    completionPercent: overrides.completionPercent ?? 90,
    estimatedVolumeKg: overrides.estimatedVolumeKg ?? 920,
    averageCompletedReps: overrides.averageCompletedReps ?? 10,
    exercises: overrides.exercises ??
      Object.freeze([
        Object.freeze({
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
          ]),
        }),
      ]),
    ...overrides,
  });
}

function createRepository(
  workout: CompletedWorkout | null = null,
): WorkoutHistoryRepository {
  return {
    saveCompletedSession: jest.fn(),
    getCompletedSessions: jest.fn(),
    getCompletedSession: jest.fn(async () => workout),
    getRecentSessions: jest.fn(),
    clearHistory: jest.fn(),
  };
}

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutDetailScreen", () => {
  beforeEach(() => {
    (router.replace as jest.Mock).mockClear();
  });

  it("loads and renders a completed workout from the mocked repository", async () => {
    const workout = createWorkout({
      id: "session:1",
      title: "Upper A",
      completedAt: "2026-07-21T12:00:00.000Z",
    });
    const repository = createRepository(workout);

    const { getByText, getByTestId } = renderScreen(
      <WorkoutDetailScreen sessionId="session:1" repository={repository} />,
    );

    await waitFor(() => {
      expect(getByTestId("workout-detail-content")).toBeTruthy();
    });

    expect(getByText("Upper A")).toBeTruthy();
    expect(getByText("Hypertrophy Block")).toBeTruthy();
    expect(getByTestId("workout-metrics-grid")).toBeTruthy();
    expect(getByText("Bench Press")).toBeTruthy();
    expect(getByText(/60 kg × 10 reps/)).toBeTruthy();
    expect(repository.getCompletedSession).toHaveBeenCalledWith("session:1");
  });

  it("shows an empty state when the workout is missing", async () => {
    const repository = createRepository(null);

    const { getByText } = renderScreen(
      <WorkoutDetailScreen sessionId="missing" repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("Workout not found")).toBeTruthy();
    });
    expect(getByText(/missing from your history/i)).toBeTruthy();
  });

  it("navigates back to history from the footer", async () => {
    const workout = createWorkout({
      id: "session:1",
      title: "Upper A",
      completedAt: "2026-07-21T12:00:00.000Z",
    });
    const repository = createRepository(workout);

    const { getByText } = renderScreen(
      <WorkoutDetailScreen sessionId="session:1" repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("Back to history")).toBeTruthy();
    });

    fireEvent.press(getByText("Back to history"));
    expect(router.replace).toHaveBeenCalledWith("/(app)/workout/history");
  });
});
