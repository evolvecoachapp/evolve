import type { ActionCandidate } from "../models/ActionCandidate";
import type { ActionPriority } from "../models/ActionPriority";
import type { ActionStep } from "../models/ActionStep";
import type { ActionType } from "../models/ActionType";
import { comparePriorities, priorityRank } from "../utils/priorityHelpers";

/**
 * Deterministic action / candidate selection helpers.
 */
export class ActionSelector {
  selectByType(
    steps: readonly ActionStep[],
    type: ActionType,
  ): readonly ActionStep[] {
    return Object.freeze(steps.filter((s) => s.type === type));
  }

  selectByMinPriority(
    steps: readonly ActionStep[],
    min: ActionPriority,
  ): readonly ActionStep[] {
    const floor = priorityRank(min);
    return Object.freeze(
      steps.filter((s) => priorityRank(s.priority) >= floor),
    );
  }

  selectTopCandidates(
    candidates: readonly ActionCandidate[],
    limit: number,
  ): readonly ActionCandidate[] {
    const sorted = [...candidates].sort(
      (a, b) =>
        b.score - a.score ||
        comparePriorities(a.priority, b.priority) ||
        a.id.localeCompare(b.id),
    );
    return Object.freeze(sorted.slice(0, Math.max(0, limit)));
  }
}
