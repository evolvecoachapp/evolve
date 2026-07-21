import { detectExercisePlateau } from "../detectExercisePlateau";
import {
  createExercise,
  createExerciseRecord,
  createSet,
  createWorkout,
} from "../../testSupport/fixtures";

describe("detectExercisePlateau", () => {
  const referenceDate = new Date("2026-07-21T12:00:00.000Z");

  const sessions = [
    createWorkout({
      id: "1",
      completedAt: "2026-06-01T12:00:00.000Z",
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([createSet({ id: "a", weightKg: 80, reps: 5 })]),
        }),
      ]),
    }),
    createWorkout({
      id: "2",
      completedAt: "2026-06-20T12:00:00.000Z",
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([createSet({ id: "b", weightKg: 80, reps: 5 })]),
        }),
      ]),
    }),
    createWorkout({
      id: "3",
      completedAt: "2026-07-10T12:00:00.000Z",
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([createSet({ id: "c", weightKg: 80, reps: 5 })]),
        }),
      ]),
    }),
  ];

  it("flags exercises whose best load is stale but still trained", () => {
    const records = [
      createExerciseRecord({
        exerciseId: "bench",
        exerciseName: "Bench",
        bestWeightKg: 80,
        lastRecordAt: "2026-06-01T12:00:00.000Z",
      }),
    ];

    const insights = detectExercisePlateau(records, sessions, {
      referenceDate,
      plateauDays: 28,
      minSessions: 3,
    });

    expect(insights).toHaveLength(1);
    expect(insights[0]?.kind).toBe("exercise_plateau");
    expect(insights[0]?.payload.exerciseId).toBe("bench");
  });

  it("skips exercises with recent record updates", () => {
    const records = [
      createExerciseRecord({
        exerciseId: "bench",
        exerciseName: "Bench",
        bestWeightKg: 90,
        lastRecordAt: "2026-07-10T12:00:00.000Z",
      }),
    ];

    expect(
      detectExercisePlateau(records, sessions, { referenceDate }),
    ).toEqual([]);
  });
});
