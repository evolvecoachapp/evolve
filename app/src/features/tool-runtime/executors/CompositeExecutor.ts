import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";
import {
  COMPOSITE_EXECUTION_STRATEGY,
  type ExecutionStrategy,
} from "./ExecutionStrategy";
import type { RuntimeExecutor } from "./ExecutionPolicy";

/**
 * Composite executor contract — delegates canExecute across children.
 */
export class CompositeExecutor implements RuntimeExecutor {
  readonly id = "executor:composite";
  readonly strategyId = COMPOSITE_EXECUTION_STRATEGY.id;

  constructor(private readonly children: readonly RuntimeExecutor[] = []) {}

  canExecute(plan: ToolExecutionPlan): boolean {
    if (this.children.length === 0) return true;
    return this.children.every((child) => child.canExecute(plan));
  }

  strategy(): ExecutionStrategy {
    return COMPOSITE_EXECUTION_STRATEGY;
  }

  listChildren(): readonly RuntimeExecutor[] {
    return Object.freeze([...this.children]);
  }
}
