import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ToolExecutionMetadata } from "./ToolExecutionMetadata";
import type { ToolExecutionStatus } from "./ToolExecutionStatus";
import type { ToolExecutionStep } from "./ToolExecutionStep";

/**
 * Immutable ordered execution plan for the Tool Runtime.
 */
export interface ToolExecutionPlan {
  readonly id: string;
  readonly actionPlanId: string;
  readonly sourceResponseId: string;
  readonly steps: readonly ToolExecutionStep[];
  readonly orderedStepIds: readonly string[];
  readonly status: ToolExecutionStatus;
  readonly metadata: ToolExecutionMetadata;
  readonly sourcePlan: ActionPlan;
  readonly createdAt: string;
  readonly frozenAt: string;
}
