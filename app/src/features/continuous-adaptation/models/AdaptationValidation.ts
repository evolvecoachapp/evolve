import type { AdaptationError } from "./AdaptationError";

export interface AdaptationValidation {
  readonly valid: boolean;
  readonly issues: readonly AdaptationError[];
}
