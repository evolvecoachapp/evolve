import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

const PRIMARY_PATTERN_WEIGHT = 4;
const SECONDARY_PATTERN_WEIGHT = 2;

/**
 * Scores / soft-filters by required and secondary movement patterns.
 */
export class MovementPatternStrategy implements SelectionStrategy {
  readonly id = "movement_pattern";

  evaluate(
    candidates: readonly ExerciseDefinition[],
    context: SelectionContext,
  ): readonly StrategyEvaluation[] {
    const required = new Set(context.requiredMovementPatterns);
    const secondary = new Set(context.secondaryMovementPatterns);

    return Object.freeze(
      candidates.map((exercise): StrategyEvaluation => {
        const pattern = exercise.movementPattern.code;
        const isRequired = required.has(pattern);
        const isSecondary = secondary.has(pattern);

        if (!isRequired && !isSecondary && required.size > 0) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: true,
            scoreParts: { movementPattern: 0 },
            reasons: Object.freeze([
              {
                code: "pattern_mismatch",
                weight: 0,
                detail: pattern,
              },
            ]),
          });
        }

        const weight = isRequired
          ? PRIMARY_PATTERN_WEIGHT
          : isSecondary
            ? SECONDARY_PATTERN_WEIGHT
            : 0;

        return Object.freeze({
          exerciseId: exercise.id,
          accepted: true,
          scoreParts: { movementPattern: weight },
          reasons: Object.freeze([
            {
              code: isRequired
                ? "pattern_primary_match"
                : "pattern_secondary_match",
              weight,
              detail: pattern,
            },
          ]),
        });
      }),
    );
  }
}
