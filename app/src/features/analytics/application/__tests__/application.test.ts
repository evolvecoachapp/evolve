import type { WorkoutAnalyticsRepository } from "../../repository";
import {
  getAnalyticsSnapshot,
  getExerciseAnalytics,
  getExerciseFrequency,
  getVolumeTrend,
  getWeeklyAnalytics,
  getWorkoutAnalytics,
  getWorkoutFrequency,
} from "../index";
import type { ExerciseAnalytics } from "../../models/ExerciseAnalytics";
import type { WeeklyAnalytics } from "../../models/WeeklyAnalytics";
import type { WorkoutAnalytics } from "../../models/WorkoutAnalytics";
import type { WorkoutTrend } from "../../models/WorkoutTrend";

function createAnalyticsRepository(): WorkoutAnalyticsRepository {
  const workout: WorkoutAnalytics = Object.freeze({
    totalWorkouts: 1,
    totalVolumeKg: 100,
    totalSets: 4,
    totalReps: 40,
    averageDurationSeconds: 1800,
    averageVolumeKg: 100,
  });
  const exercises: readonly ExerciseAnalytics[] = Object.freeze([
    Object.freeze({
      exerciseId: "bench",
      exerciseName: "Bench",
      bestWeightKg: 60,
      bestVolumeKg: 480,
      averageReps: 8,
      sessionsPerformed: 1,
      lastPerformedAt: "2026-07-21T12:00:00.000Z",
    }),
  ]);
  const weekly: WeeklyAnalytics = Object.freeze({
    currentWeekVolumeKg: 100,
    previousWeekVolumeKg: 0,
    sessionsPerWeek: 1,
  });
  const volumeTrend: WorkoutTrend = Object.freeze({
    metric: "volume",
    points: Object.freeze([
      Object.freeze({ periodStart: "2026-07-20", value: 100 }),
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

describe("analytics application use-cases", () => {
  it("delegates each use-case to the injected repository", async () => {
    const repository = createAnalyticsRepository();
    const referenceDate = new Date("2026-07-21T15:00:00.000Z");

    await expect(getWorkoutAnalytics(repository)).resolves.toMatchObject({
      totalWorkouts: 1,
    });
    await expect(getExerciseAnalytics(undefined, repository)).resolves.toHaveLength(
      1,
    );
    await expect(
      getWeeklyAnalytics(referenceDate, repository),
    ).resolves.toMatchObject({ currentWeekVolumeKg: 100 });
    await expect(getVolumeTrend(4, referenceDate, repository)).resolves.toMatchObject({
      metric: "volume",
    });
    await expect(
      getWorkoutFrequency(4, referenceDate, repository),
    ).resolves.toMatchObject({ metric: "workout_frequency" });
    await expect(
      getExerciseFrequency("bench", 4, referenceDate, repository),
    ).resolves.toMatchObject({ metric: "exercise_frequency" });

    expect(repository.getWorkoutAnalytics).toHaveBeenCalledTimes(1);
    expect(repository.getExerciseAnalytics).toHaveBeenCalledWith(undefined);
    expect(repository.getWeeklyAnalytics).toHaveBeenCalledWith(referenceDate);
    expect(repository.getVolumeTrend).toHaveBeenCalledWith(4, referenceDate);
    expect(repository.getWorkoutFrequency).toHaveBeenCalledWith(4, referenceDate);
    expect(repository.getExerciseFrequency).toHaveBeenCalledWith(
      "bench",
      4,
      referenceDate,
    );
  });

  it("loads a parallel analytics snapshot", async () => {
    const repository = createAnalyticsRepository();
    const snapshot = await getAnalyticsSnapshot({
      weeks: 4,
      repository,
    });

    expect(snapshot.workout.totalWorkouts).toBe(1);
    expect(snapshot.exercises).toHaveLength(1);
    expect(snapshot.weekly.currentWeekVolumeKg).toBe(100);
    expect(snapshot.volumeTrend.metric).toBe("volume");
    expect(snapshot.workoutFrequency.metric).toBe("workout_frequency");
  });
});
