import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import {
  difficultyRank,
  isDifficultyWithinCap,
} from "../utils/difficultyRank";
import type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

const WITHIN_CAP_WEIGHT = 2;

/**
 * Soft-scores and hard-rejects by difficulty cap.
 */
export class DifficultyStrategy implements SelectionStrategy {
  readonly id = "difficulty";

  evaluate(
    candidates: readonly ExerciseDefinition[],
    context: SelectionContext,
  ): readonly StrategyEvaluation[] {
    return Object.freeze(
      candidates.map((exercise): StrategyEvaluation => {
        const level = exercise.difficulty.level;

        if (!isDifficultyWithinCap(level, context.maxDifficulty)) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: false,
            scoreParts: { difficulty: 0 },
            reasons: Object.freeze([
              {
                code: "difficulty_exceeds_cap",
                weight: 0,
                detail: level,
              },
            ]),
          });
        }

        // Prefer closer-to-cap difficulty when a cap exists; otherwise prefer mid skill.
        let weight = WITHIN_CAP_WEIGHT;
        if (context.maxDifficulty) {
          const delta =
            difficultyRank(context.maxDifficulty) - difficultyRank(level);
          weight = WITHIN_CAP_WEIGHT + Math.max(0, 1 - delta * 0.25);
        } else {
          const skillCentered = 1 - Math.abs(exercise.difficulty.skillScore - 5) / 10;
          weight = WITHIN_CAP_WEIGHT + skillCentered;
        }

        return Object.freeze({
          exerciseId: exercise.id,
          accepted: true,
          scoreParts: { difficulty: Math.round(weight * 1000) / 1000 },
          reasons: Object.freeze([
            {
              code: "difficulty_suitable",
              weight: Math.round(weight * 1000) / 1000,
              detail: level,
            },
          ]),
        });
      }),
    );
  }
}
