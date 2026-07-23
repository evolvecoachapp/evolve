import type { ToolExecutionContext } from "./ToolExecutionContext";
import type { ToolExecutionPlan } from "./ToolExecutionPlan";
import type { ToolExecutionMetadata } from "./ToolExecutionMetadata";

/**
 * Immutable request handed to the Execution Pipeline.
 */
export interface ToolExecutionRequest {
  readonly id: string;
  readonly plan: ToolExecutionPlan;
  readonly context: ToolExecutionContext;
  readonly strategyId: string;
  readonly metadata: ToolExecutionMetadata;
  readonly createdAt: string;
}
