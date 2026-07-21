import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { ExerciseRecord } from "../../features/records/models/ExerciseRecord";
import type { RecordSummary } from "../../features/records/models/RecordSummary";
import type { WorkoutRecord } from "../../features/records/models/WorkoutRecord";
import type { WorkoutRecordsRepository } from "../../features/records/repository";
import { ThemeProvider } from "../../theme/ThemeContext";
import { WorkoutRecordsScreen } from "../WorkoutRecordsScreen";

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
  workoutRecord?: WorkoutRecord;
  exercises?: readonly ExerciseRecord[];
  summary?: RecordSummary;
  fail?: boolean;
}): WorkoutRecordsRepository {
  const workoutRecord: WorkoutRecord = Object.freeze(
    options?.workoutRecord ?? {
      bestWeightKg: 140,
      bestEstimatedOneRMKg: 155,
      bestSessionVolumeKg: 1800,
      bestSingleSetVolumeKg: 840,
      bestReps: 12,
      lastRecordAt: "2026-07-21T12:00:00.000Z",
    },
  );
  const exercises: readonly ExerciseRecord[] = Object.freeze(
    options?.exercises ?? [
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
    ],
  );
  const summary: RecordSummary = Object.freeze(
    options?.summary ?? {
      totalLifetimeVolumeKg: 4200,
      totalLifetimeSessions: 12,
      exerciseCount: 1,
      lastRecordAt: "2026-07-21T12:00:00.000Z",
    },
  );

  if (options?.fail) {
    return {
      getWorkoutRecord: jest.fn(async () => {
        throw new Error("records unavailable");
      }),
      getExerciseRecords: jest.fn(async () => exercises),
      getRecordSummary: jest.fn(async () => summary),
    };
  }

  return {
    getWorkoutRecord: jest.fn(async () => workoutRecord),
    getExerciseRecords: jest.fn(async () => exercises),
    getRecordSummary: jest.fn(async () => summary),
  };
}

function renderScreen(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("WorkoutRecordsScreen", () => {
  it("shows an empty state when there are no sessions", async () => {
    const repository = createRepository({
      workoutRecord: Object.freeze({
        bestWeightKg: null,
        bestEstimatedOneRMKg: null,
        bestSessionVolumeKg: null,
        bestSingleSetVolumeKg: null,
        bestReps: null,
        lastRecordAt: null,
      }),
      exercises: Object.freeze([]),
      summary: Object.freeze({
        totalLifetimeVolumeKg: 0,
        totalLifetimeSessions: 0,
        exerciseCount: 0,
        lastRecordAt: null,
      }),
    });

    const { getByText } = renderScreen(
      <WorkoutRecordsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("No records yet")).toBeTruthy();
    });
    expect(getByText(/Complete a workout/i)).toBeTruthy();
  });

  it("renders records content from the mocked repository", async () => {
    const repository = createRepository();
    const { getByText, getByTestId } = renderScreen(
      <WorkoutRecordsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByTestId("workout-records-content")).toBeTruthy();
    });

    expect(getByText("Your strongest marks")).toBeTruthy();
    expect(getByTestId("lifetime-stats-card")).toBeTruthy();
    expect(getByTestId("record-card")).toBeTruthy();
    expect(getByTestId("exercise-record-card")).toBeTruthy();
    expect(getByText("Back Squat")).toBeTruthy();
    expect(repository.getWorkoutRecord).toHaveBeenCalled();
    expect(repository.getRecordSummary).toHaveBeenCalled();
  });

  it("surfaces repository errors", async () => {
    const repository = createRepository({ fail: true });
    const { getByText } = renderScreen(
      <WorkoutRecordsScreen repository={repository} />,
    );

    await waitFor(() => {
      expect(getByText("records unavailable")).toBeTruthy();
    });
  });
});
