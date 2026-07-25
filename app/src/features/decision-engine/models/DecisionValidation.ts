import type { DecisionError } from "./DecisionError";

/**
 * Immutable validation report.
 */
export interface DecisionValidation {
  readonly valid: boolean;
  readonly errors: readonly DecisionError[];
  readonly warnings: readonly string[];
}
