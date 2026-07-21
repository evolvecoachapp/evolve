import type { CompletedWorkout } from "../../../workout/models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../../workout/repository";
import { HistoryBackedWorkoutAnalyticsRepository } from "../HistoryBackedWorkoutAnalyticsRepository";
import {
  createExercise,
  createSet,
  createWorkout,
} from "../../testSupport/fixtures";

function createHistory(
  sessions: readonly CompletedWorkout[],
): WorkoutHistoryRepository {
  return {
    saveCompletedSession: jest.fn(),
    getCompletedSessions: jest.fn(async () => sessions),
    getCompletedSession: jest.fn(),
    getRecentSessions: jest.fn(),
    clearHistory: jest.fn(),
  };
}

describe("HistoryBackedWorkoutAnalyticsRepository", () => {
  const referenceDate = new Date("2026-07-21T15:00:00.000Z");

  const sessions = [
    createWorkout({
      id: "a",
      completedAt: "2026-07-15T12:00:00.000Z",
      durationSeconds: 2400,
      completedSets: 6,
      estimatedVolumeKg: 900,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([
            createSet({ id: "s1", weightKg: 60, reps: 8 }),
          ]),
        }),
      ]),
    }),
    createWorkout({
      id: "b",
      completedAt: "2026-07-21T12:00:00.000Z",
      durationSeconds: 3000,
      completedSets: 8,
      estimatedVolumeKg: 1100,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([
            createSet({ id: "s2", weightKg: 80, reps: 5 }),
          ]),
        }),
      ]),
    }),
  ];

  it("computes workout analytics from history", async () => {
    const repository = new HistoryBackedWorkoutAnalyticsRepository(
      createHistory(sessions),
    );

    await expect(repository.getWorkoutAnalytics()).resolves.toEqual({
      totalWorkouts: 2,
      totalVolumeKg: 2000,
      totalSets: 14,
      totalReps: 13,
      averageDurationSeconds: 2700,
      averageVolumeKg: 1000,
    });
  });

  it("returns all or filtered exercise analytics", async () => {
    const repository = new HistoryBackedWorkoutAnalyticsRepository(
      createHistory(sessions),
    );

    const all = await repository.getExerciseAnalytics();
    expect(all).toHaveLength(1);
    expect(all[0]?.bestWeightKg).toBe(80);

    const filtered = await repository.getExerciseAnalytics("bench");
    expect(filtered).toHaveLength(1);

    const missing = await repository.getExerciseAnalytics("missing");
    expect(missing).toEqual([]);
  });

  it("computes weekly analytics and trend APIs", async () => {
    const history = createHistory(sessions);
    const repository = new HistoryBackedWorkoutAnalyticsRepository(history);

    const weekly = await repository.getWeeklyAnalytics(referenceDate);
    expect(weekly.currentWeekVolumeKg).toBe(1100);
    expect(weekly.previousWeekVolumeKg).toBe(900);

    const volumeTrend = await repository.getVolumeTrend(2, referenceDate);
    expect(volumeTrend.metric).toBe("volume");
    expect(volumeTrend.points).toHaveLength(2);

    const frequency = await repository.getWorkoutFrequency(2, referenceDate);
    expect(frequency.metric).toBe("workout_frequency");
    expect(frequency.points[1]?.value).toBe(1);

    const exerciseFrequency = await repository.getExerciseFrequency(
      "bench",
      2,
      referenceDate,
    );
    expect(exerciseFrequency.metric).toBe("exercise_frequency");
    expect(exerciseFrequency.points.every((p) => p.value === 1)).toBe(true);

    expect(history.getCompletedSessions).toHaveBeenCalled();
  });
});
