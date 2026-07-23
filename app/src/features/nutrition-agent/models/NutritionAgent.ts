import type { NutritionAgentMetadata } from "./NutritionMetadata";

/**
 * Nutrition Agent configuration descriptor.
 */
export interface NutritionAgent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly strategyIds: readonly string[];
  readonly policyIds: readonly string[];
  readonly reasonerIds: readonly string[];
  readonly plannerIds: readonly string[];
  readonly metadata: NutritionAgentMetadata;
  readonly createdAt: string;
}
