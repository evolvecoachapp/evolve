import type { NutritionCapability } from "./NutritionCapability";
import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionValidation } from "./NutritionValidation";

/**
 * Immutable evaluation record for a nutrition plan / request (orchestration only).
 */
export interface NutritionEvaluation {
  readonly id: string;
  readonly planId: string | null;
  readonly requestId: string | null;
  readonly capability: NutritionCapability | null;
  readonly validation: NutritionValidation;
  readonly findings: readonly string[];
  readonly score: number | null;
  readonly metadata: NutritionAgentMetadata;
  readonly evaluatedAt: string;
}
