import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

const CONSTRAINT_CLEAR_WEIGHT = 2;
const SOFT_PENALTY = -1;

/**
 * Applies blueprint injury/preference/equipment constraints against exercise
 * contraindications and constraint codes.
 */
export class ConstraintStrategy implements SelectionStrategy {
  readonly id = "constraint";

  evaluate(
    candidates: readonly ExerciseDefinition[],
    context: SelectionContext,
  ): readonly StrategyEvaluation[] {
    const hardCodes = new Set(
      context.constraints
        .filter((constraint) => constraint.severity === "hard")
        .map((constraint) => constraint.code),
    );
    const softCodes = new Set(
      context.constraints
        .filter((constraint) => constraint.severity === "soft")
        .map((constraint) => constraint.code),
    );
    const excluded = new Set(context.excludedExerciseIds);

    return Object.freeze(
      candidates.map((exercise): StrategyEvaluation => {
        if (excluded.has(exercise.id)) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: false,
            scoreParts: { constraint: 0 },
            reasons: Object.freeze([
              {
                code: "explicitly_excluded",
                weight: 0,
                detail: exercise.id,
              },
            ]),
          });
        }

        const exerciseCodes = new Set([
          ...exercise.contraindications,
          ...exercise.constraints.map((constraint) => constraint.code),
        ]);

        const hardHits = [...hardCodes].filter((code) => exerciseCodes.has(code));
        if (hardHits.length > 0) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: false,
            scoreParts: { constraint: 0 },
            reasons: Object.freeze([
              {
                code: "hard_constraint_violation",
                weight: 0,
                detail: hardHits.sort().join(","),
              },
            ]),
          });
        }

        const softHits = [...softCodes].filter((code) => exerciseCodes.has(code));
        if (softHits.length > 0) {
          const weight = CONSTRAINT_CLEAR_WEIGHT + softHits.length * SOFT_PENALTY;
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: true,
            scoreParts: { constraint: weight },
            reasons: Object.freeze([
              {
                code: "soft_constraint_penalty",
                weight,
                detail: softHits.sort().join(","),
              },
            ]),
          });
        }

        return Object.freeze({
          exerciseId: exercise.id,
          accepted: true,
          scoreParts: { constraint: CONSTRAINT_CLEAR_WEIGHT },
          reasons: Object.freeze([
            {
              code: "constraints_clear",
              weight: CONSTRAINT_CLEAR_WEIGHT,
            },
          ]),
        });
      }),
    );
  }
}
