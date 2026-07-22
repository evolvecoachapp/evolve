import type { WorkoutBlock } from "../models/WorkoutBlock";
import type { WorkoutExercise, WorkoutSet } from "../models/WorkoutExercise";
import type { WorkoutExecutionOrder } from "../models/WorkoutExecutionOrder";
import type { WorkoutSession } from "../models/WorkoutSession";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import { sortExercises } from "./sortExercises";

/**
 * Normalize a WorkoutSession: sort exercises, rebuild execution order, sync summary totals.
 */
export function normalizeSession(session: WorkoutSession): WorkoutSession {
  const exercises = sortExercises(session.exercises.map(normalizeExercise));
  const blocks = Object.freeze(
    [...session.blocks]
      .sort((left, right) => left.order - right.order)
      .map(normalizeBlock),
  );
  const executionOrder = buildExecutionOrder(exercises, blocks);

  return Object.freeze({
    ...session,
    focus: Object.freeze({ ...session.focus }),
    priority: Object.freeze({ ...session.priority }),
    exercises,
    blocks,
    executionOrder,
    summary: normalizeSummary(session.summary),
    notes: Object.freeze([...session.notes]),
    estimatedDurationSeconds: exercises.reduce(
      (sum, exercise) => sum + exercise.estimatedDurationSeconds,
      0,
    ),
    estimatedWorkload: round3(
      exercises.reduce((sum, exercise) => sum + exercise.estimatedWorkload, 0),
    ),
  });
}

export function buildExecutionOrder(
  exercises: readonly WorkoutExercise[],
  blocks: readonly WorkoutBlock[],
): WorkoutExecutionOrder {
  return Object.freeze({
    exerciseIds: Object.freeze(exercises.map((exercise) => exercise.id)),
    blockIds: Object.freeze(blocks.map((block) => block.id)),
  });
}

function normalizeExercise(exercise: WorkoutExercise): WorkoutExercise {
  return Object.freeze({
    ...exercise,
    sets: Object.freeze(exercise.sets.map(normalizeSet)),
    notes: Object.freeze([...exercise.notes]),
    cues: Object.freeze([...exercise.cues]),
    appliedRecommendationIds: Object.freeze([
      ...exercise.appliedRecommendationIds,
    ]),
    tempo: exercise.tempo ? Object.freeze({ ...exercise.tempo }) : null,
  });
}

function normalizeSet(set: WorkoutSet): WorkoutSet {
  return Object.freeze({ ...set });
}

function normalizeBlock(block: WorkoutBlock): WorkoutBlock {
  return Object.freeze({
    ...block,
    exerciseIds: Object.freeze([...block.exerciseIds]),
  });
}

function normalizeSummary(summary: WorkoutSummary): WorkoutSummary {
  return Object.freeze({ ...summary });
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
