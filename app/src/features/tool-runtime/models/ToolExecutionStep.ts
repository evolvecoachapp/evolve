import type { ActionStep } from "../../action-engine/models/ActionStep";
import type { ToolExecutionMetadata } from "./ToolExecutionMetadata";
import type { ToolExecutionStatus } from "./ToolExecutionStatus";

/**
 * Immutable runtime step derived from an ActionStep.
 * Holds resolution targets — no domain execution payload.
 */
export interface ToolExecutionStep {
  readonly id: string;
  readonly planId: string;
  readonly actionStepId: string;
  readonly actionType: string;
  readonly label: string;
  readonly toolId: string | null;
  readonly adapterId: string | null;
  readonly order: number;
  readonly dependsOn: readonly string[];
  readonly status: ToolExecutionStatus;
  readonly sourceStep: ActionStep;
  readonly metadata: ToolExecutionMetadata;
}
