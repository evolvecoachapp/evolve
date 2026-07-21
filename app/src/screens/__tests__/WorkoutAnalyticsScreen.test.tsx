import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ExerciseAnalytics } from "../../features/analytics/models/ExerciseAnalytics";
import type { WeeklyAnalytics } from "../../features/analytics/models/WeeklyAnalytics";
import type { WorkoutAnalytics } from "../../features/analytics/models/WorkoutAnalytics";
import type { WorkoutTrend } from "../../features/analytics/models/WorkoutTrend";
import type { WorkoutAnalyticsRepository } from "../../features/analytics/repository";
import { ThemeProvider } from "../../theme/ThemeContext";
import { WorkoutAnalyticsScreen } from "../WorkoutAnalyticsScreen";

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

function createRepository(options?: {
  workout?: WorkoutAnalytics;
  exercises?: readonly ExerciseAnalytics[];
  weekly?: WeeklyAnalytics;
  volumeTrend?: WorkoutTrend;
  workoutFrequency?: WorkoutTrend;
  fail?: boolean;
}): WorkoutAnalyticsRepository {
  const workout: WorkoutAnalytics = Object.freeze(
    options?.workout ?? {
      totalWorkouts: 4,
      totalVolumeKg: 2000,
      totalSets: 32,
      totalReps: 256,
      averageDurationSeconds: 2700,
      averageVolumeKg: 500,
    },
  );
  const exercises: readonly ExerciseAnalytics[] = Object.freeze(
    options?.exercises ?? [
      Object.freeze({
        exerciseId: "squat",
        exerciseName: "Back Squat",
        bestWeightKg: 140,
        bestVolumeKg: 840,
        averageReps: 6,
        sessionsPerformed: 4,
        lastPerformedAt: "2026-07-21T12:00:00.000Z",
      }),
    ],
  );
  const weekly: WeeklyAnalytics = Object.freeze(
    options?.weekly ?? {
      currentWeekVolumeKg: 800,
      previousWeekVolumeKg: 600,
      sessionsPerWeek: 2,
    },
  );
  const emptyTrend: WorkoutTrend = Object.freeze({
    metric: "volume",
    points: Object.freeze([]),
  });
  const volumeTrend: WorkoutTrend = Object.freeze(
    options?.volumeTrend ?? {
      metric: "volume",
      points: Object.freeze([
        Object.freeze({ periodStart: "2026-07-06", value: 600 }),
        Object.freeze({ periodStart: "2026-07-13", value: 800 }),
      ]),
    },
  );
  const workoutFrequency: WorkoutTrend = Object.freeze(
    options?.workoutFrequency ?? {
      metric: "workout_frequency",
      points: Object.freeze([
        Object.freeze({ periodStart: "2026-07-06", value: 2 }),
        Object.freeze({ periodStart: "2026-07-13", value: 3 }),
      ]),
    },
  );

  if (options?.fail) {
    return {
      getWorkoutAnalytics: jest.fn(async () => {
        throw new Error("analytics unavailable");
      }),
      getExerciseAnalytics: jest.fn(async () => exercises),
      getWeeklyAnalytics: jest.fn(async () => weekly),
      getVolumeTrend: jest.fn(async () => volumeTrend),
      getWorkoutFrequency: jest.fn(async () => workoutFrequency),
      getExerciseFrequency: jest.fn(async () => emptyTrend),
    };
  }

  return {
    getWorkoutAnalytics: jest.fn(async () => workout),
    getExerciseAnalytics: jest.fn(async () => exercises),
    getWeeklyAnalytics: jest.fn(async () => weekly),
    getVolumeTrend: jest.fn(async () => volumeTrend),
    getWorkoutFrequency: jest.fn(async () => workoutFrequency),
    getExerciseFrequency: jest.fn(async () => emptyTrend),
  };
}

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutAnalyticsScreen", () => {
  it("shows an empty state when there are no workouts", async () => {
    const repository = createRepository({
      workout: Object.freeze({
        totalWorkouts: 0,
        totalVolumeKg: 0,
        totalSets: 0,
        totalReps: 0,
        averageDurationSeconds: null,
        averageVolumeKg: null,
      }),
      exercises: Object.freeze([]),
      weekly: Object.freeze({
        currentWeekVolumeKg: 0,
        previousWeekVolumeKg: 0,
        sessionsPerWeek: 0,
      }),
    });

    const { getByText } = renderScreen(
      <WorkoutAnalyticsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("No analytics yet")).toBeTruthy();
    });
    expect(getByText(/Complete a workout/i)).toBeTruthy();
  });

  it("renders analytics content from the mocked repository", async () => {
    const repository = createRepository();
    const { getByText, getByTestId } = renderScreen(
      <WorkoutAnalyticsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByTestId("workout-analytics-content")).toBeTruthy();
    });

    expect(getByText("Performance overview")).toBeTruthy();
    expect(getByText("Back Squat")).toBeTruthy();
    expect(getByTestId("weekly-summary-card")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
    expect(getByTestId("volume-trend-chart")).toBeTruthy();
    expect(getByTestId("workout-frequency-chart")).toBeTruthy();
    expect(getByTestId("weekly-volume-chart")).toBeTruthy();
    expect(getByText("Volume Trend")).toBeTruthy();
    expect(getByText("Workout Frequency")).toBeTruthy();
    expect(getByText("Weekly Volume")).toBeTruthy();
    expect(repository.getWorkoutAnalytics).toHaveBeenCalled();
    expect(repository.getVolumeTrend).toHaveBeenCalled();
  });

  it("hides charts when analytics are empty", async () => {
    const repository = createRepository({
      workout: Object.freeze({
        totalWorkouts: 0,
        totalVolumeKg: 0,
        totalSets: 0,
        totalReps: 0,
        averageDurationSeconds: null,
        averageVolumeKg: null,
      }),
      exercises: Object.freeze([]),
      weekly: Object.freeze({
        currentWeekVolumeKg: 0,
        previousWeekVolumeKg: 0,
        sessionsPerWeek: 0,
      }),
    });

    const { getByText, queryByTestId } = renderScreen(
      <WorkoutAnalyticsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("No analytics yet")).toBeTruthy();
    });
    expect(queryByTestId("volume-trend-chart")).toBeNull();
    expect(queryByTestId("workout-frequency-chart")).toBeNull();
    expect(queryByTestId("weekly-volume-chart")).toBeNull();
  });

  it("surfaces repository errors", async () => {
    const repository = createRepository({ fail: true });
    const { getByText } = renderScreen(
      <WorkoutAnalyticsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("analytics unavailable")).toBeTruthy();
    });
  });
});
