import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import {
  PARALLEL_EXECUTION_STRATEGY,
  type ExecutionStrategy,
} from "./ExecutionStrategy";
import {
  DefaultExecutionPolicy,
  type ExecutionPolicy,
  type RuntimeExecutor,
} from "./ExecutionPolicy";

/**
 * Parallel executor contract — no real parallel implementation required.
 */
export class ParallelExecutor implements RuntimeExecutor {
  readonly id = "executor:parallel";
  readonly strategyId = PARALLEL_EXECUTION_STRATEGY.id;

  constructor(private readonly policy: ExecutionPolicy = new DefaultExecutionPolicy()) {}

  canExecute(plan: ToolExecutionPlan): boolean {
    return this.policy.canExecute(plan);
  }

  strategy(): ExecutionStrategy {
    return PARALLEL_EXECUTION_STRATEGY;
  }
}
