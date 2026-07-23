import type { ActionExecutionPlan } from "../models/ActionExecutionPlan";
import type { ExecutionContext } from "./ExecutionContext";
import type { ExecutionStrategy } from "./ExecutionStrategy";

/**
 * Immutable execution request contract for future runtimes.
 */
export interface ExecutionRequest {
  readonly id: string;
  readonly executionPlan: ActionExecutionPlan;
  readonly context: ExecutionContext;
  readonly strategy: ExecutionStrategy;
  readonly createdAt: string;
}

export function createExecutionRequest(
  partial: ExecutionRequest,
): ExecutionRequest {
  return Object.freeze({ ...partial });
}
