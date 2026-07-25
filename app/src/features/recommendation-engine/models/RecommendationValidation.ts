import type { RecommendationError } from "./RecommendationError";

export interface RecommendationValidation {
  readonly valid: boolean;
  readonly errors: readonly RecommendationError[];
  readonly warnings: readonly string[];
}
