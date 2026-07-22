import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { SelectionContext } from "../models/SelectionContext";
import type { SelectionReason } from "../models/SelectionReason";
import type { SelectionScoreParts } from "../utils/calculateSelectionScore";

/**
 * Per-exercise evaluation produced by a single strategy.
 * Strategies never coordinate with each other.
 */
export interface StrategyEvaluation {
  readonly exerciseId: string;
  /** Hard reject removes the candidate from further consideration. */
  readonly accepted: boolean;
  readonly scoreParts: SelectionScoreParts;
  readonly reasons: readonly SelectionReason[];
}

/**
 * Independent selection strategy.
 * Receives the full candidate pool and returns per-exercise evaluations.
 */
export interface SelectionStrategy {
  readonly id: string;
  evaluate(
    candidates: readonly ExerciseDefinition[],
    context: SelectionContext,
  ): readonly StrategyEvaluation[];
}
