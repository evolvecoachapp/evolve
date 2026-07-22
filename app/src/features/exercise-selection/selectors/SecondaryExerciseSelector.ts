import type { CandidateExercise } from "../models/CandidateExercise";
import type { SelectionContext } from "../models/SelectionContext";
import { rankCandidates, type RankableCandidate } from "../utils/rankCandidates";
import type { ExerciseRoleSelector } from "./ExerciseRoleSelector";

/**
 * Selects secondary supporting exercise candidates.
 * Prefers secondary focus patterns; falls back to primary patterns
 * excluding already preferred primaries via compound preference.
 */
export class SecondaryExerciseSelector implements ExerciseRoleSelector {
  readonly role = "secondary" as const;

  select(
    scored: readonly RankableCandidate[],
    context: SelectionContext,
  ): readonly CandidateExercise[] {
    const secondaryPatterns = new Set(context.secondaryMovementPatterns);
    const primaryPatterns = new Set(context.requiredMovementPatterns);

    const secondaryPool = scored.filter((candidate) => {
      const pattern = candidate.exercise.movementPattern.code;
      if (secondaryPatterns.size > 0) {
        return secondaryPatterns.has(pattern);
      }
      return primaryPatterns.has(pattern) && candidate.exercise.category.isCompound;
    });

    const pool =
      secondaryPool.length > 0
        ? secondaryPool
        : scored.filter((candidate) =>
            primaryPatterns.has(candidate.exercise.movementPattern.code),
          );

    return rankCandidates(pool, this.role, context.maxCandidatesPerRole);
  }
}
