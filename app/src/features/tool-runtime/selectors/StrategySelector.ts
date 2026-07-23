import type { ExecutionStrategy } from "../executors/ExecutionStrategy";
import {
  COMPOSITE_EXECUTION_STRATEGY,
  CONDITIONAL_EXECUTION_STRATEGY,
  DEFAULT_EXECUTION_STRATEGY,
  PARALLEL_EXECUTION_STRATEGY,
} from "../executors/ExecutionStrategy";
import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";

/**
 * Deterministic strategy selection.
 */
export class StrategySelector {
  readonly id = "selector:strategy:default";

  select(plan: ToolExecutionPlan, preferredId?: string): ExecutionStrategy {
    const catalog = this.list();
    if (preferredId) {
      const match = catalog.find((s) => s.id === preferredId);
      if (match) return match;
    }
    if (plan.steps.length <= 1) return DEFAULT_EXECUTION_STRATEGY;
    return DEFAULT_EXECUTION_STRATEGY;
  }

  list(): readonly ExecutionStrategy[] {
    return Object.freeze([
      DEFAULT_EXECUTION_STRATEGY,
      PARALLEL_EXECUTION_STRATEGY,
      CONDITIONAL_EXECUTION_STRATEGY,
      COMPOSITE_EXECUTION_STRATEGY,
    ]);
  }
}
