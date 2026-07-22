import type { PromptContextKind } from "./PromptContextKind";

/**
 * Relative context budget — weights only, no token estimation.
 */
export interface PromptBudget {
  /** Maximum total relative weight allowed in a composition. */
  readonly maxWeight: number;
  /** Relative weight contribution per included context kind. */
  readonly weights: Readonly<Record<PromptContextKind, number>>;
}
