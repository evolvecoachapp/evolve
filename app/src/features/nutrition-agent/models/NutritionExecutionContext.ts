import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionContext } from "./NutritionContext";

/**
 * Immutable execution-context placeholder (no tool execution here).
 */
export interface NutritionExecutionContext {
  readonly id: string;
  readonly context: NutritionContext;
  readonly pendingToolIds: readonly string[];
  readonly metadata: NutritionAgentMetadata;
  readonly frozenAt: string;
}
