import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import type { ToolExecutionRequest } from "../models/ToolExecutionRequest";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";

/**
 * Executor contract — orchestration abstractions only.
 */
export interface RuntimeExecutor {
  readonly id: string;
  readonly strategyId: string;
  canExecute(plan: ToolExecutionPlan): boolean;
  /**
   * Contract placeholder for strategy-specific execution.
   * Real dispatch is coordinated by ExecutionPipeline.
   */
  execute?(
    request: ToolExecutionRequest,
  ): Promise<ToolExecutionResult>;
}

/**
 * Structural execution policy for executors (contract).
 */
export interface ExecutionPolicy {
  readonly id: string;
  canExecute(plan: ToolExecutionPlan): boolean;
  maxSteps(plan: ToolExecutionPlan): number;
}

export class DefaultExecutionPolicy implements ExecutionPolicy {
  readonly id = "policy:execution:default";

  canExecute(plan: ToolExecutionPlan): boolean {
    return plan.steps.length >= 0;
  }

  maxSteps(plan: ToolExecutionPlan): number {
    return plan.steps.length;
  }
}
