import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionContext } from "../models/SelectionContext";
import { rankCandidates, type RankableCandidate } from "../utils/rankCandidates";
import type { ExerciseRoleSelector } from "./ExerciseRoleSelector";

/**
 * Selects accessory / isolation candidates for the session focus.
 */
export class AccessoryExerciseSelector implements ExerciseRoleSelector {
  readonly role = "accessory" as const;

  select(
    scored: readonly RankableCandidate[],
    context: SelectionContext,
  ): readonly CandidateExercise[] {
    const focusPatterns = new Set([
      ...context.requiredMovementPatterns,
      ...context.secondaryMovementPatterns,
    ]);

    const isolationPool = scored.filter((candidate) => {
      const { exercise } = candidate;
      const isAccessoryCategory =
        !exercise.category.isCompound ||
        exercise.category.code === "isolation" ||
        exercise.metadata.tags.some((tag) => tag.code === "accessory");

      if (!isAccessoryCategory) {
        return false;
      }

      if (focusPatterns.size === 0) {
        return true;
      }

      // Allow isolation pattern or any focus-aligned pattern for accessories.
      return (
        exercise.movementPattern.code === "isolation" ||
        focusPatterns.has(exercise.movementPattern.code)
      );
    });

    const pool =
      isolationPool.length > 0
        ? isolationPool
        : scored.filter(
            (candidate) =>
              !candidate.exercise.category.isCompound ||
              candidate.exercise.movementPattern.code === "isolation",
          );

    return rankCandidates(pool, this.role, context.maxCandidatesPerRole);
  }
}
