import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

const RELATIONSHIP_DENSITY_WEIGHT = 0.5;
const ALTERNATIVE_BONUS = 0.25;

/**
 * Soft-scores exercises that participate in richer relationship graphs.
 * Does not select alternatives for programming — ranking signal only.
 */
export class RelationshipStrategy implements SelectionStrategy {
  readonly id = "relationship";

  evaluate(
    candidates: readonly ExerciseDefinition[],
    _context: SelectionContext,
  ): readonly StrategyEvaluation[] {
    const catalogIds = new Set(candidates.map((exercise) => exercise.id));

    return Object.freeze(
      candidates.map((exercise): StrategyEvaluation => {
        const resolvable = exercise.relationships.filter((edge) =>
          catalogIds.has(edge.targetExerciseId),
        );
        const alternatives = resolvable.filter(
          (edge) => edge.kind === "alternative",
        );

        const weight =
          Math.round(
            (resolvable.length * RELATIONSHIP_DENSITY_WEIGHT +
              alternatives.length * ALTERNATIVE_BONUS) *
              1000,
          ) / 1000;

        return Object.freeze({
          exerciseId: exercise.id,
          accepted: true,
          scoreParts: { relationship: weight },
          reasons: Object.freeze([
            {
              code:
                resolvable.length > 0
                  ? "relationship_graph_present"
                  : "relationship_graph_empty",
              weight,
              detail: String(resolvable.length),
            },
          ]),
        });
      }),
    );
  }
}
