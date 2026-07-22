import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import type {
  SelectionStrategy,
  StrategyEvaluation,
} from "./SelectionStrategy";

const EQUIPMENT_MATCH_WEIGHT = 3;

/**
 * Filters by available equipment. Hard-rejects when required gear is missing.
 * When availableEquipment is null, all exercises are accepted with neutral score.
 */
export class EquipmentStrategy implements SelectionStrategy {
  readonly id = "equipment";

  evaluate(
    candidates: readonly ExerciseDefinition[],
    context: SelectionContext,
  ): readonly StrategyEvaluation[] {
    const available = context.availableEquipment
      ? new Set(context.availableEquipment)
      : null;

    return Object.freeze(
      candidates.map((exercise): StrategyEvaluation => {
        const requiredEquipment = exercise.equipment
          .filter((entry) => entry.required)
          .map((entry) => entry.equipment);

        if (!available) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: true,
            scoreParts: { equipment: EQUIPMENT_MATCH_WEIGHT },
            reasons: Object.freeze([
              {
                code: "equipment_unconstrained",
                weight: EQUIPMENT_MATCH_WEIGHT,
              },
            ]),
          });
        }

        if (requiredEquipment.length === 0) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: true,
            scoreParts: { equipment: EQUIPMENT_MATCH_WEIGHT },
            reasons: Object.freeze([
              {
                code: "equipment_none_required",
                weight: EQUIPMENT_MATCH_WEIGHT,
              },
            ]),
          });
        }

        const missing = requiredEquipment.filter((code) => !available.has(code));
        if (missing.length > 0) {
          return Object.freeze({
            exerciseId: exercise.id,
            accepted: false,
            scoreParts: { equipment: 0 },
            reasons: Object.freeze([
              {
                code: "equipment_unavailable",
                weight: 0,
                detail: missing.slice().sort().join(","),
              },
            ]),
          });
        }

        return Object.freeze({
          exerciseId: exercise.id,
          accepted: true,
          scoreParts: { equipment: EQUIPMENT_MATCH_WEIGHT },
          reasons: Object.freeze([
            {
              code: "equipment_available",
              weight: EQUIPMENT_MATCH_WEIGHT,
              detail: requiredEquipment.slice().sort().join(","),
            },
          ]),
        });
      }),
    );
  }
}
