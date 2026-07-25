import type { DecisionConflict } from "../models/DecisionConflict";
import type {
  DecisionResolution,
  DecisionResolutionStrategy,
} from "../models/DecisionResolution";
import { DecisionResolutionStrategies } from "../models/DecisionResolution";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import type { DecisionCandidate } from "../models/DecisionCandidate";
import { freezeResolution } from "../utils/FreezeDecisionState";
import { isHigherPriority } from "../utils/PriorityHelpers";

/**
 * Resolution planner — chooses deterministic strategies (no heuristics/AI).
 */
export function planResolutions(input: {
  readonly conflicts: readonly DecisionConflict[];
  readonly candidates: readonly DecisionCandidate[];
  readonly at: string;
}): readonly DecisionResolution[] {
  const byId = new Map(input.candidates.map((c) => [c.id, c]));
  return Object.freeze(
    input.conflicts.map((conflict) => {
      const left = byId.get(conflict.leftId);
      const right = byId.get(conflict.rightId);
      let strategy: DecisionResolutionStrategy =
        DecisionResolutionStrategies.HIGHER_PRIORITY;
      let winnerId: string | null = conflict.leftId;
      let loserIds: string[] = [conflict.rightId];

      if (left?.category === "safety" || right?.category === "safety") {
        strategy = DecisionResolutionStrategies.SAFETY_FIRST;
        const safety = left?.category === "safety" ? left : right!;
        const other = safety.id === conflict.leftId ? right! : left!;
        winnerId = safety.id;
        loserIds = [other.id];
      } else if (left && right) {
        if (isHigherPriority(right.category, left.category)) {
          winnerId = right.id;
          loserIds = [left.id];
        }
      }

      return freezeResolution({
        id: `resolution:${conflict.id}`,
        conflictId: conflict.id,
        strategy,
        winnerId,
        loserIds: Object.freeze(loserIds),
        notes: Object.freeze([strategy]),
        metadata: EMPTY_DECISION_METADATA,
        resolvedAt: input.at,
      });
    }),
  );
}
