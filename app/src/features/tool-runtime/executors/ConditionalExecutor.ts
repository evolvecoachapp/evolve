import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import {
  CONDITIONAL_EXECUTION_STRATEGY,
  type ExecutionStrategy,
} from "./ExecutionStrategy";
import {
  DefaultExecutionPolicy,
  type ExecutionPolicy,
  type RuntimeExecutor,
} from "./ExecutionPolicy";

/**
 * Conditional executor contract — evaluates readiness only.
 */
export class ConditionalExecutor implements RuntimeExecutor {
  readonly id = "executor:conditional";
  readonly strategyId = CONDITIONAL_EXECUTION_STRATEGY.id;

  constructor(private readonly policy: ExecutionPolicy = new DefaultExecutionPolicy()) {}

  canExecute(plan: ToolExecutionPlan): boolean {
    return (
      this.policy.canExecute(plan) &&
      plan.steps.every((s) => s.status === "ready" || s.status === "pending")
    );
  }

  strategy(): ExecutionStrategy {
    return CONDITIONAL_EXECUTION_STRATEGY;
  }
}
