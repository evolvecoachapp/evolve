import type { PromptBudget } from "../models/PromptBudget";
import type { PromptContextKind } from "../models/PromptContextKind";

/**
 * Sum relative weights for the given kinds.
 */
export function calculateContextWeight(
  kinds: readonly PromptContextKind[],
  budget: PromptBudget,
): number {
  return kinds.reduce((sum, kind) => sum + budget.weights[kind], 0);
}
