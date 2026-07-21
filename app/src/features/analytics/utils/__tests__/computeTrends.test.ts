import {
  computeExerciseFrequency,
  computeVolumeTrend,
  computeWorkoutFrequency,
} from "../computeTrends";
import { startOfUtcWeek, toUtcDateString } from "../weekBounds";
import { createExercise, createSet, createWorkout } from "../../testSupport/fixtures";

describe("computeTrends", () => {
  const referenceDate = new Date("2026-07-21T15:00:00.000Z");
  const currentMonday = toUtcDateString(startOfUtcWeek(referenceDate));

  const sessions = [
    createWorkout({
      id: "w1",
      completedAt: "2026-07-08T12:00:00.000Z",
      estimatedVolumeKg: 400,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([createSet({ id: "s1", weightKg: 60, reps: 8 })]),
        }),
      ]),
    }),
    createWorkout({
      id: "w2",
      completedAt: "2026-07-21T12:00:00.000Z",
      estimatedVolumeKg: 600,
      exercises: Object.freeze([
        createExercise({
          id: "bench",
          name: "Bench",
          sets: Object.freeze([createSet({ id: "s2", weightKg: 70, reps: 5 })]),
        }),
      ]),
    }),
    createWorkout({
      id: "w3",
      completedAt: "2026-07-21T18:00:00.000Z",
      estimatedVolumeKg: 200,
      exercises: Object.freeze([]),
    }),
  ];

  it("builds a volume trend with zero-filled weeks", () => {
    const trend = computeVolumeTrend(sessions, {
      weeks: 3,
      referenceDate,
    });

    expect(trend.metric).toBe("volume");
    expect(trend.points).toHaveLength(3);
    expect(trend.points[2]).toEqual({
      periodStart: currentMonday,
      value: 800,
    });
    expect(trend.points[0]?.value).toBe(400);
    expect(trend.points[1]?.value).toBe(0);
  });

  it("builds workout frequency counts per week", () => {
    const trend = computeWorkoutFrequency(sessions, {
      weeks: 3,
      referenceDate,
    });

    expect(trend.metric).toBe("workout_frequency");
    expect(trend.points[2]?.value).toBe(2);
    expect(trend.points[0]?.value).toBe(1);
  });

  it("builds exercise frequency for sessions that include the exercise", () => {
    const trend = computeExerciseFrequency(sessions, "bench", {
      weeks: 3,
      referenceDate,
    });

    expect(trend.metric).toBe("exercise_frequency");
    expect(trend.points[2]?.value).toBe(1);
    expect(trend.points[0]?.value).toBe(1);
    expect(trend.points[1]?.value).toBe(0);
  });
});
