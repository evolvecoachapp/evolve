import type { WorkoutAnalytics } from "../../../analytics/models/WorkoutAnalytics";
import type { CompletedWorkout } from "../../../workout/models/CompletedWorkout";
import type { WorkoutHistoryRepository } from "../../../workout/repository";
import type { WorkoutAnalyticsRepository } from "../../../analytics/repository";
import { HistoryBackedWorkoutRecordsRepository } from "../HistoryBackedWorkoutRecordsRepository";
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

function createAnalytics(
  workout: WorkoutAnalytics,
): WorkoutAnalyticsRepository {
  return {
    getWorkoutAnalytics: jest.fn(async () => workout),
    getExerciseAnalytics: jest.fn(async () => Object.freeze([])),
    getWeeklyAnalytics: jest.fn(),
    getVolumeTrend: jest.fn(),
    getWorkoutFrequency: jest.fn(),
    getExerciseFrequency: jest.fn(),
  };
}

describe("HistoryBackedWorkoutRecordsRepository", () => {
  const sessions = [
    createWorkout({
      id: "a",
      completedAt: "2026-07-15T12:00:00.000Z",
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
      estimatedVolumeKg: 1100,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([
            createSet({ id: "s2", weightKg: 80, reps: 5 }),
          ]),
        }),
        createExercise({
          id: "squat",
          name: "Squat",
          sets: Object.freeze([
            createSet({ id: "s3", weightKg: 120, reps: 3 }),
          ]),
        }),
      ]),
    }),
  ];

  const workoutAnalytics: WorkoutAnalytics = Object.freeze({
    totalWorkouts: 2,
    totalVolumeKg: 2000,
    totalSets: 14,
    totalReps: 16,
    averageDurationSeconds: 2700,
    averageVolumeKg: 1000,
  });

  it("computes workout record highlights from history", async () => {
    const analytics = createAnalytics(workoutAnalytics);
    const history = createHistory(sessions);
    const repository = new HistoryBackedWorkoutRecordsRepository(
      analytics,
      history,
    );

    // Best weight 120; Epley(120,3)=132; Epley(80,5)=93.33; Epley(60,8)=76
    // Best session volume 1100; best single-set 60*8=480; best reps 8
    await expect(repository.getWorkoutRecord()).resolves.toEqual({
      bestWeightKg: 120,
      bestEstimatedOneRMKg: 132,
      bestSessionVolumeKg: 1100,
      bestSingleSetVolumeKg: 480,
      bestReps: 8,
      lastRecordAt: "2026-07-21T12:00:00.000Z",
    });

    expect(history.getCompletedSessions).toHaveBeenCalled();
  });

  it("returns all or filtered exercise records", async () => {
    const repository = new HistoryBackedWorkoutRecordsRepository(
      createAnalytics(workoutAnalytics),
      createHistory(sessions),
    );

    const all = await repository.getExerciseRecords();
    expect(all).toHaveLength(2);
    expect(all[0]?.exerciseId).toBe("squat");
    expect(all[0]?.bestEstimatedOneRM?.estimatedKg).toBe(132);
    expect(all[1]?.bestWeightKg).toBe(80);

    const filtered = await repository.getExerciseRecords("bench");
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.bestReps).toBe(8);

    const missing = await repository.getExerciseRecords("missing");
    expect(missing).toEqual([]);
  });

  it("builds record summary from analytics lifetime totals", async () => {
    const analytics = createAnalytics(workoutAnalytics);
    const history = createHistory(sessions);
    const repository = new HistoryBackedWorkoutRecordsRepository(
      analytics,
      history,
    );

    await expect(repository.getRecordSummary()).resolves.toEqual({
      totalLifetimeVolumeKg: 2000,
      totalLifetimeSessions: 2,
      exerciseCount: 2,
      lastRecordAt: "2026-07-21T12:00:00.000Z",
    });

    expect(analytics.getWorkoutAnalytics).toHaveBeenCalled();
    expect(history.getCompletedSessions).toHaveBeenCalled();
  });

  it("returns empty records when history is empty", async () => {
    const emptyAnalytics: WorkoutAnalytics = Object.freeze({
      totalWorkouts: 0,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      averageDurationSeconds: null,
      averageVolumeKg: null,
    });
    const repository = new HistoryBackedWorkoutRecordsRepository(
      createAnalytics(emptyAnalytics),
      createHistory([]),
    );

    await expect(repository.getWorkoutRecord()).resolves.toEqual({
      bestWeightKg: null,
      bestEstimatedOneRMKg: null,
      bestSessionVolumeKg: null,
      bestSingleSetVolumeKg: null,
      bestReps: null,
      lastRecordAt: null,
    });

    await expect(repository.getRecordSummary()).resolves.toEqual({
      totalLifetimeVolumeKg: 0,
      totalLifetimeSessions: 0,
      exerciseCount: 0,
      lastRecordAt: null,
    });
  });
});
