import type { PromptBudget } from "../models/PromptBudget";
import type { PromptContextKind } from "../models/PromptContextKind";
import type { PromptPriority } from "../models/PromptPriority";
import { calculateContextWeight } from "./calculateContextWeight";
import { rankContext } from "./rankContext";

export interface TrimContextResult {
  readonly kept: readonly PromptContextKind[];
  readonly trimmed: readonly PromptContextKind[];
  readonly usedWeight: number;
}

/**
 * Remove lowest-priority kinds until the budget is satisfied.
 *
 * Never estimates tokens — relative weights only.
 */
export function trimContext(
  kinds: readonly PromptContextKind[],
  budget: PromptBudget,
  priority: PromptPriority,
): TrimContextResult {
  const unique = Object.freeze([...new Set(kinds)]);
  let kept = [...unique];
  const trimmed: PromptContextKind[] = [];

  while (
    kept.length > 0 &&
    calculateContextWeight(kept, budget) > budget.maxWeight
  ) {
    const ascending = rankContext(kept, priority, "asc");
    const remove = ascending[0];
    if (remove === undefined) {
      break;
    }
    trimmed.push(remove);
    kept = kept.filter((kind) => kind !== remove);
  }

  return Object.freeze({
    kept: Object.freeze(kept),
    trimmed: Object.freeze(trimmed),
    usedWeight: calculateContextWeight(kept, budget),
  });
}
