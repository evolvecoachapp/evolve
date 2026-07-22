import type { ExerciseDefinition } from "../models/ExerciseDefinition";

/**
 * Relative complexity score derived from knowledge metadata.
 * Pure metric — no formatting. Higher means more demanding.
 */
export function calculateExerciseComplexity(
  definition: ExerciseDefinition,
): number {
  let complexity = 1;

  complexity += definition.difficulty.skillScore / 2;
  complexity += definition.fatigueScore / 4;
  complexity += definition.jointStress / 4;

  if (definition.axialLoading) {
    complexity += 1;
  }

  if (definition.category.isCompound) {
    complexity += 1;
  }

  if (definition.category.isUnilateral) {
    complexity += 0.5;
  }

  if (definition.primaryMuscles.length > 1) {
    complexity += 0.5;
  }

  switch (definition.difficulty.level) {
    case "beginner":
      break;
    case "intermediate":
      complexity += 0.5;
      break;
    case "advanced":
      complexity += 1;
      break;
    case "expert":
      complexity += 1.5;
      break;
  }

  return Math.round(complexity * 10) / 10;
}
