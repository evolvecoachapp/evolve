import {
  computeWorkoutAnalytics,
  sumSessionReps,
} from "../computeWorkoutAnalytics";
import { createExercise, createSet, createWorkout } from "../../testSupport/fixtures";

describe("computeWorkoutAnalytics", () => {
  it("returns zeros and null averages for empty history", () => {
    expect(computeWorkoutAnalytics([])).toEqual({
      totalWorkouts: 0,
      totalVolumeKg: 0,
      totalSets: 0,
      totalReps: 0,
      averageDurationSeconds: null,
      averageVolumeKg: null,
    });
  });

  it("aggregates totals and averages across sessions", () => {
    const sessions = [
      createWorkout({
        id: "a",
        completedAt: "2026-07-20T12:00:00.000Z",
        durationSeconds: 3000,
        completedSets: 10,
        estimatedVolumeKg: 1000,
        exercises: Object.freeze([
          createExercise({
            id: "ex-1",
            name: "Bench",
            sets: Object.freeze([
              createSet({ id: "s1", weightKg: 60, reps: 8 }),
              createSet({ id: "s2", weightKg: 60, reps: 8 }),
            ]),
          }),
        ]),
      }),
      createWorkout({
        id: "b",
        completedAt: "2026-07-21T12:00:00.000Z",
        durationSeconds: 2000,
        completedSets: 6,
        estimatedVolumeKg: 500,
        exercises: Object.freeze([
          createExercise({
            id: "ex-2",
            name: "Squat",
            sets: Object.freeze([
              createSet({ id: "s3", weightKg: 100, reps: 5 }),
            ]),
          }),
        ]),
      }),
    ];

    expect(computeWorkoutAnalytics(sessions)).toEqual({
      totalWorkouts: 2,
      totalVolumeKg: 1500,
      totalSets: 16,
      totalReps: 21,
      averageDurationSeconds: 2500,
      averageVolumeKg: 750,
    });
  });

  it("falls back to averageCompletedReps for legacy sessions without exercises", () => {
    const session = createWorkout({
      id: "legacy",
      completedAt: "2026-07-21T12:00:00.000Z",
      completedSets: 8,
      averageCompletedReps: 10,
      exercises: Object.freeze([]),
    });

    expect(sumSessionReps(session)).toBe(80);
    expect(computeWorkoutAnalytics([session]).totalReps).toBe(80);
  });
});
