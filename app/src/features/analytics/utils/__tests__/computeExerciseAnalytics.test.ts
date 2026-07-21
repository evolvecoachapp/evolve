import {
  computeExerciseAnalytics,
  computeExerciseAnalyticsForId,
} from "../computeExerciseAnalytics";
import { createExercise, createSet, createWorkout } from "../../testSupport/fixtures";

describe("computeExerciseAnalytics", () => {
  const sessions = [
    createWorkout({
      id: "s1",
      completedAt: "2026-07-14T12:00:00.000Z",
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench Press",
          sets: Object.freeze([
            createSet({ id: "a", weightKg: 60, reps: 8 }),
            createSet({ id: "b", weightKg: 70, reps: 5 }),
          ]),
        }),
      ]),
    }),
    createWorkout({
      id: "s2",
      completedAt: "2026-07-21T12:00:00.000Z",
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench Press",
          sets: Object.freeze([
            createSet({ id: "c", weightKg: 80, reps: 3 }),
          ]),
        }),
        createExercise({
          id: "squat",
          name: "Back Squat",
          sets: Object.freeze([
            createSet({ id: "d", weightKg: 100, reps: 5 }),
          ]),
        }),
      ]),
    }),
  ];

  it("computes best weight, best volume, average reps, sessions, last performed", () => {
    const result = computeExerciseAnalytics(sessions);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      exerciseId: "bench",
      exerciseName: "Bench Press",
      bestWeightKg: 80,
      bestVolumeKg: 480, // 60 × 8
      averageReps: roundAverage([8, 5, 3]),
      sessionsPerformed: 2,
      lastPerformedAt: "2026-07-21T12:00:00.000Z",
    });
    expect(result[1]).toMatchObject({
      exerciseId: "squat",
      sessionsPerformed: 1,
      bestWeightKg: 100,
      bestVolumeKg: 500,
    });
  });

  it("returns a single exercise when filtered by id", () => {
    expect(computeExerciseAnalyticsForId(sessions, "squat")).toMatchObject({
      exerciseId: "squat",
      sessionsPerformed: 1,
    });
    expect(computeExerciseAnalyticsForId(sessions, "missing")).toBeNull();
  });

  it("ignores sessions without exercise snapshots", () => {
    expect(
      computeExerciseAnalytics([
        createWorkout({
          id: "legacy",
          completedAt: "2026-07-21T12:00:00.000Z",
          exercises: Object.freeze([]),
        }),
      ]),
    ).toEqual([]);
  });
});

function roundAverage(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return Math.round(mean * 100) / 100;
}
