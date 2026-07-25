import type { ExplanationError } from "./ExplanationError";

export interface ExplanationValidation {
  readonly valid: boolean;
  readonly issues: readonly ExplanationError[];
}
