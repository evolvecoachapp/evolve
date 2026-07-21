import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ExerciseRecord } from "../../models/ExerciseRecord";
import type { RecordSummary } from "../../models/RecordSummary";
import type { WorkoutRecord } from "../../models/WorkoutRecord";
import type { WorkoutRecordsRepository } from "../../repository";
import { useWorkoutRecords } from "../useWorkoutRecords";

function createRepository(): WorkoutRecordsRepository {
  const workoutRecord: WorkoutRecord = Object.freeze({
    bestWeightKg: 120,
    bestEstimatedOneRMKg: 132,
    bestSessionVolumeKg: 1100,
    bestSingleSetVolumeKg: 480,
    bestReps: 8,
    lastRecordAt: "2026-07-21T12:00:00.000Z",
  });
  const exercises: readonly ExerciseRecord[] = Object.freeze([
    Object.freeze({
      exerciseId: "squat",
      exerciseName: "Squat",
      bestWeightKg: 120,
      bestEstimatedOneRM: Object.freeze({
        exerciseId: "squat",
        exerciseName: "Squat",
        weightKg: 120,
        reps: 3,
        estimatedKg: 132,
        achievedAt: "2026-07-21T12:00:00.000Z",
      }),
      bestSingleSetVolumeKg: 360,
      bestReps: 3,
      lastRecordAt: "2026-07-21T12:00:00.000Z",
    }),
  ]);
  const summary: RecordSummary = Object.freeze({
    totalLifetimeVolumeKg: 2000,
    totalLifetimeSessions: 2,
    exerciseCount: 1,
    lastRecordAt: "2026-07-21T12:00:00.000Z",
  });

  return {
    getWorkoutRecord: jest.fn(async () => workoutRecord),
    getExerciseRecords: jest.fn(async () => exercises),
    getRecordSummary: jest.fn(async () => summary),
  };
}

describe("useWorkoutRecords", () => {
  it("loads records through the injected repository", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useWorkoutRecords({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.workoutRecord?.bestWeightKg).toBe(120);
    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.summary?.totalLifetimeSessions).toBe(2);
    expect(repository.getWorkoutRecord).toHaveBeenCalled();
    expect(repository.getExerciseRecords).toHaveBeenCalled();
    expect(repository.getRecordSummary).toHaveBeenCalled();
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getWorkoutRecord as jest.Mock).mockRejectedValue(
      new Error("records failed"),
    );

    const { result } = renderHook(() => useWorkoutRecords({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workoutRecord).toBeNull();
    expect(result.current.error).toBe("records failed");
  });

  it("ignores late results after unmount", async () => {
    let resolveRecord: (value: WorkoutRecord) => void = () => undefined;
    const repository = createRepository();
    (repository.getWorkoutRecord as jest.Mock).mockImplementation(
      () =>
        new Promise<WorkoutRecord>((resolve) => {
          resolveRecord = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useWorkoutRecords({ repository }),
    );
    unmount();

    await act(async () => {
      resolveRecord({
        bestWeightKg: 200,
        bestEstimatedOneRMKg: 220,
        bestSessionVolumeKg: 1,
        bestSingleSetVolumeKg: 1,
        bestReps: 1,
        lastRecordAt: "2026-07-21T12:00:00.000Z",
      });
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.workoutRecord).toBeNull();
  });
});
