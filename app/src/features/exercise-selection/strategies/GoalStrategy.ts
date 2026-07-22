import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

const GOAL_MATCH_WEIGHT = 3;
const GOAL_PARTIAL_WEIGHT = 1;

/**
 * Scores exercises by allowedGoals alignment with blueprint priority.
 */
export class GoalStrategy implements SelectionStrategy {
  readonly id = "goal";

  evaluate(
    candidates: readonly ExerciseDefinition[],
    context: SelectionContext,
  ): readonly StrategyEvaluation[] {
    const goals = new Set(context.goalCodes);

    return Object.freeze(
      candidates.map((exercise): StrategyEvaluation => {
        const matches = exercise.allowedGoals.filter((goal) => goals.has(goal));
        if (matches.length === 0) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: true,
            scoreParts: { goal: 0 },
            reasons: Object.freeze([
              {
                code: "goal_mismatch",
                weight: 0,
              },
            ]),
          });
        }

        const weight =
          matches.length >= goals.size
            ? GOAL_MATCH_WEIGHT
            : GOAL_PARTIAL_WEIGHT + matches.length * 0.5;

        return Object.freeze({
          exerciseId: exercise.id,
          accepted: true,
          scoreParts: { goal: Math.round(weight * 1000) / 1000 },
          reasons: Object.freeze([
            {
              code: "goal_match",
              weight: Math.round(weight * 1000) / 1000,
              detail: matches.slice().sort().join(","),
            },
          ]),
        });
      }),
    );
  }
}
