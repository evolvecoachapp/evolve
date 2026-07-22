import type { WorkoutBlock } from "../models/WorkoutBlock";
import type { WorkoutExercise } from "../models/WorkoutExercise";
import type { WorkoutSummary } from "../models/WorkoutSummary";
import { estimateDuration } from "./estimateDuration";
import { estimateWorkload } from "./estimateWorkload";

/**
 * Build an immutable WorkoutSummary from assembled exercises and blocks.
 */
export function buildSummary(input: {
  readonly exercises: readonly WorkoutExercise[];
  readonly blocks: readonly WorkoutBlock[];
  readonly readinessScore: number;
}): WorkoutSummary {
  const { exercises, blocks, readinessScore } = input;
  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.setCount,
    0,
  );
  const totalRepsMin = exercises.reduce(
    (sum, exercise) => sum + exercise.setCount * exercise.repMin,
    0,
  );
  const totalRepsMax = exercises.reduce(
    (sum, exercise) => sum + exercise.setCount * exercise.repMax,
    0,
  );
  const appliedRecommendationCount = new Set(
    exercises.flatMap((exercise) => exercise.appliedRecommendationIds),
  ).size;

  return Object.freeze({
    exerciseCount: exercises.length,
    blockCount: blocks.length,
    totalSets,
    totalRepsMin,
    totalRepsMax,
    estimatedDurationSeconds: estimateDuration(exercises),
    estimatedWorkload: estimateWorkload(exercises),
    appliedRecommendationCount,
    readinessScore,
  });
}
