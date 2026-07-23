import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import {
  DEFAULT_EXECUTION_STRATEGY,
  type ExecutionStrategy,
} from "./ExecutionStrategy";
import {
  DefaultExecutionPolicy,
  type ExecutionPolicy,
  type RuntimeExecutor,
} from "./ExecutionPolicy";

export class SequentialExecutor implements RuntimeExecutor {
  readonly id = "executor:sequential";
  readonly strategyId = DEFAULT_EXECUTION_STRATEGY.id;

  constructor(private readonly policy: ExecutionPolicy = new DefaultExecutionPolicy()) {}

  canExecute(plan: ToolExecutionPlan): boolean {
    return this.policy.canExecute(plan);
  }

  strategy(): ExecutionStrategy {
    return DEFAULT_EXECUTION_STRATEGY;
  }
}
