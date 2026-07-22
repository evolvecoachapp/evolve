import type { PromptBudget } from "../models/PromptBudget";
import type { PromptContextKind } from "../models/PromptContextKind";
import { createDefaultPromptPolicy } from "../utils/createDefaultPromptPolicy";

/**
 * Pure budget rules — relative weights only, no token estimation.
 */
export class PromptBudgetPolicy {
  private readonly budget: PromptBudget;

  constructor(budget: PromptBudget = createDefaultPromptPolicy().budget) {
    this.budget = Object.freeze({
      maxWeight: budget.maxWeight,
      weights: Object.freeze({ ...budget.weights }),
    });
  }

  maxWeight(): number {
    return this.budget.maxWeight;
  }

  weightOf(kind: PromptContextKind): number {
    return this.budget.weights[kind];
  }

  totalWeight(kinds: readonly PromptContextKind[]): number {
    return kinds.reduce((sum, kind) => sum + this.weightOf(kind), 0);
  }

  exceeds(kinds: readonly PromptContextKind[]): boolean {
    return this.totalWeight(kinds) > this.budget.maxWeight;
  }

  toBudget(): PromptBudget {
    return this.budget;
  }
}
