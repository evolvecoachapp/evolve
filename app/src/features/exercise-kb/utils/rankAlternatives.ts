import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import type { ExerciseRelationship } from "../models/ExerciseRelationship";

export interface RankedAlternative {
  readonly exercise: ExerciseDefinition;
  readonly relationship: ExerciseRelationship;
  readonly score: number;
}

/**
 * Rank alternative exercises by relationship strength and complexity proximity.
 * Pure — does not select for workouts.
 */
export function rankAlternatives(
  source: ExerciseDefinition,
  candidates: readonly ExerciseDefinition[],
  relationships: readonly ExerciseRelationship[],
): readonly RankedAlternative[] {
  const byId = new Map(
    candidates.map((exercise) => [exercise.id, exercise] as const),
  );

  const ranked: RankedAlternative[] = [];

  for (const relationship of relationships) {
    if (relationship.kind !== "alternative") {
      continue;
    }
    const exercise = byId.get(relationship.targetExerciseId);
    if (!exercise) {
      continue;
    }

    const complexityDelta = Math.abs(
      source.fatigueScore - exercise.fatigueScore,
    );
    const skillDelta = Math.abs(
      source.difficulty.skillScore - exercise.difficulty.skillScore,
    );
    const patternBonus =
      source.movementPattern.code === exercise.movementPattern.code ? 0.2 : 0;
    const muscleBonus = sharePrimaryMuscle(source, exercise) ? 0.15 : 0;

    const score =
      relationship.strength +
      patternBonus +
      muscleBonus -
      complexityDelta * 0.05 -
      skillDelta * 0.03;

    ranked.push({
      exercise,
      relationship,
      score: Math.round(score * 1000) / 1000,
    });
  }

  return Object.freeze(
    [...ranked].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.exercise.id.localeCompare(b.exercise.id);
    }),
  );
}

function sharePrimaryMuscle(
  left: ExerciseDefinition,
  right: ExerciseDefinition,
): boolean {
  const rightCodes = new Set(right.primaryMuscles.map((muscle) => muscle.code));
  return left.primaryMuscles.some((muscle) => rightCodes.has(muscle.code));
}
