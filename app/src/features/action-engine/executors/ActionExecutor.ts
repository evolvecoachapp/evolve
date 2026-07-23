import type { ActionPlan } from "../models/ActionPlan";
import type { ExecutionContext } from "./ExecutionContext";
import type { ExecutionRequest } from "./ExecutionRequest";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Execution contract only — Action Engine never invokes domain tools.
 * Future Tool Runtime implements this interface.
 */
export interface ActionExecutor {
  readonly id: string;
  prepare(
    plan: ActionPlan,
    context: ExecutionContext,
  ): ExecutionRequest;
  /**
   * Contract placeholder. Implementations live in future runtimes.
   * Must not be called by Action Engine services.
   */
  execute?(request: ExecutionRequest): Promise<ExecutionResult>;
}
