import type { ActionPlan } from "./ActionPlan";
import type { ActionStep } from "./ActionStep";

/**
 * Immutable ordered view of steps prepared for a future runtime.
 * Contracts only — Action Engine does not execute.
 */
export interface ActionExecutionPlan {
  readonly id: string;
  readonly planId: string;
  readonly orderedStepIds: readonly string[];
  readonly steps: readonly ActionStep[];
  readonly estimatedStepCount: number;
  readonly createdAt: string;
  readonly sourcePlan: ActionPlan;
}
