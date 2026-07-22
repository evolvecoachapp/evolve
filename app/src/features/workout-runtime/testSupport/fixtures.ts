import type { WorkoutExercise } from "../../workout-assembly/models/WorkoutExercise";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";

const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

function createExercise(input: {
  readonly id: string;
  readonly exerciseId: string;
  readonly name: string;
  readonly order: number;
  readonly setCount: number;
}): WorkoutExercise {
  const sets = Array.from({ length: input.setCount }, (_, index) =>
    Object.freeze({
      setIndex: index + 1,
      repMin: 5,
      repMax: 8,
      targetRpe: 8,
      targetRir: 2,
    }),
  );

  return Object.freeze({
    id: input.id,
    exerciseId: input.exerciseId,
    name: input.name,
    role: "primary" as const,
    order: input.order,
    blockId: "block-1",
    sets: Object.freeze(sets),
    setCount: input.setCount,
    repMin: 5,
    repMax: 8,
    intensityMetric: "rpe" as const,
    intensityValue: 8,
    restSeconds: 120,
    betweenSetsRestSeconds: 90,
    tempo: null,
    notes: Object.freeze([] as string[]),
    cues: Object.freeze([] as string[]),
    appliedRecommendationIds: Object.freeze([] as string[]),
    estimatedDurationSeconds: 300,
    estimatedWorkload: 10,
    fatigueEstimate: 0.4,
    skillEstimate: 0.5,
  });
}

/**
 * Minimal immutable WorkoutSession for workout-runtime tests.
 * Does not invoke Program Generation or Assembly engines.
 */
export function createMinimalWorkoutSession(
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession {
  const exercises = Object.freeze([
    createExercise({
      id: "we-squat",
      exerciseId: "ex-squat",
      name: "Back Squat",
      order: 1,
      setCount: 2,
    }),
    createExercise({
      id: "we-bench",
      exerciseId: "ex-bench",
      name: "Bench Press",
      order: 2,
      setCount: 2,
    }),
  ]);

  return Object.freeze({
    id: overrides.id ?? "session-runtime-1",
    blueprintId: overrides.blueprintId ?? "blueprint-1",
    dayId: overrides.dayId ?? "day-1",
    dayIndex: overrides.dayIndex ?? 1,
    weekNumber: overrides.weekNumber ?? 1,
    name: overrides.name ?? "Runtime Test Session",
    focus: overrides.focus ??
      Object.freeze({ primary: "full_body" as const, secondary: null }),
    sessionGoal: overrides.sessionGoal ?? "balanced_development",
    priority: overrides.priority ??
      Object.freeze({ primary: "strength" as const, secondary: null }),
    exercises: overrides.exercises ?? exercises,
    blocks: overrides.blocks ??
      Object.freeze([
        Object.freeze({
          id: "block-1",
          kind: "primary" as const,
          role: "primary" as const,
          order: 1,
          label: "Main",
          exerciseIds: Object.freeze(exercises.map((item) => item.id)),
          estimatedDurationSeconds: 600,
        }),
      ]),
    executionOrder: overrides.executionOrder ??
      Object.freeze({
        exerciseIds: Object.freeze(exercises.map((item) => item.id)),
        blockIds: Object.freeze(["block-1"]),
      }),
    summary: overrides.summary ??
      Object.freeze({
        exerciseCount: exercises.length,
        blockCount: 1,
        totalSets: 4,
        totalRepsMin: 20,
        totalRepsMax: 32,
        estimatedDurationSeconds: 600,
        estimatedWorkload: 20,
        appliedRecommendationCount: 0,
        readinessScore: 0.8,
      }),
    notes: overrides.notes ?? Object.freeze(["fixture"]),
    estimatedDurationSeconds: overrides.estimatedDurationSeconds ?? 600,
    estimatedWorkload: overrides.estimatedWorkload ?? 20,
    assembledAt: overrides.assembledAt ?? FIXED_TIMESTAMP,
  });
}

export { FIXED_TIMESTAMP };
