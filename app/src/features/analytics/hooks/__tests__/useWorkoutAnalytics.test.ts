import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ExerciseAnalytics } from "../../models/ExerciseAnalytics";
import type { WeeklyAnalytics } from "../../models/WeeklyAnalytics";
import type { WorkoutAnalytics } from "../../models/WorkoutAnalytics";
import type { WorkoutTrend } from "../../models/WorkoutTrend";
import type { WorkoutAnalyticsRepository } from "../../repository";
import { useWorkoutAnalytics } from "../useWorkoutAnalytics";

function createRepository(): WorkoutAnalyticsRepository {
  const workout: WorkoutAnalytics = Object.freeze({
    totalWorkouts: 2,
    totalVolumeKg: 2000,
    totalSets: 14,
    totalReps: 100,
    averageDurationSeconds: 2700,
    averageVolumeKg: 1000,
  });
  const exercises: readonly ExerciseAnalytics[] = Object.freeze([
    Object.freeze({
      exerciseId: "bench",
      exerciseName: "Bench",
      bestWeightKg: 80,
      bestVolumeKg: 480,
      averageReps: 6.5,
      sessionsPerformed: 2,
      lastPerformedAt: "2026-07-21T12:00:00.000Z",
    }),
  ]);
  const weekly: WeeklyAnalytics = Object.freeze({
    currentWeekVolumeKg: 1100,
    previousWeekVolumeKg: 900,
    sessionsPerWeek: 1,
  });
  const volumeTrend: WorkoutTrend = Object.freeze({
    metric: "volume",
    points: Object.freeze([
      Object.freeze({ periodStart: "2026-07-20", value: 1100 }),
    ]),
  });
  const workoutFrequency: WorkoutTrend = Object.freeze({
    metric: "workout_frequency",
    points: Object.freeze([
      Object.freeze({ periodStart: "2026-07-20", value: 1 }),
    ]),
  });
  const exerciseFrequency: WorkoutTrend = Object.freeze({
    metric: "exercise_frequency",
    points: Object.freeze([
      Object.freeze({ periodStart: "2026-07-20", value: 1 }),
    ]),
  });

  return {
    getWorkoutAnalytics: jest.fn(async () => workout),
    getExerciseAnalytics: jest.fn(async () => exercises),
    getWeeklyAnalytics: jest.fn(async () => weekly),
    getVolumeTrend: jest.fn(async () => volumeTrend),
    getWorkoutFrequency: jest.fn(async () => workoutFrequency),
    getExerciseFrequency: jest.fn(async () => exerciseFrequency),
  };
}

describe("useWorkoutAnalytics", () => {
  it("loads analytics through the injected repository", async () => {
    const repository = createRepository();
    const { result } = renderHook(() =>
      useWorkoutAnalytics({ repository, weeks: 4 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.workout?.totalWorkouts).toBe(2);
    expect(result.current.exercises).toHaveLength(1);
    expect(result.current.weekly?.currentWeekVolumeKg).toBe(1100);
    expect(result.current.volumeTrend?.metric).toBe("volume");
    expect(result.current.workoutFrequency?.metric).toBe("workout_frequency");
    expect(repository.getWorkoutAnalytics).toHaveBeenCalled();
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getWorkoutAnalytics as jest.Mock).mockRejectedValue(
      new Error("analytics failed"),
    );

    const { result } = renderHook(() => useWorkoutAnalytics({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workout).toBeNull();
    expect(result.current.error).toBe("analytics failed");
  });

  it("loads exercise frequency on demand", async () => {
    const repository = createRepository();
    const { result } = renderHook(() =>
      useWorkoutAnalytics({ repository, weeks: 4 }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let trend: WorkoutTrend | undefined;
    await act(async () => {
      trend = await result.current.loadExerciseFrequency("bench");
    });

    expect(trend?.metric).toBe("exercise_frequency");
    expect(repository.getExerciseFrequency).toHaveBeenCalledWith(
      "bench",
      4,
      undefined,
    );
  });

  it("ignores late results after unmount", async () => {
    let resolveWorkout: (value: WorkoutAnalytics) => void = () => undefined;
    const repository = createRepository();
    (repository.getWorkoutAnalytics as jest.Mock).mockImplementation(
      () =>
        new Promise<WorkoutAnalytics>((resolve) => {
          resolveWorkout = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useWorkoutAnalytics({ repository }),
    );
    unmount();

    await act(async () => {
      resolveWorkout({
        totalWorkouts: 9,
        totalVolumeKg: 1,
        totalSets: 1,
        totalReps: 1,
        averageDurationSeconds: 1,
        averageVolumeKg: 1,
      });
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.workout).toBeNull();
  });
});
