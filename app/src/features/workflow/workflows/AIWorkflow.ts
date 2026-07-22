import type { ToolResult } from "../../tool-calling/models/ToolResult";
import type { WorkflowCapability } from "../models/WorkflowCapability";
import type { WorkflowContext } from "../models/WorkflowContext";
import type { WorkflowRequest } from "../models/WorkflowRequest";
import type { WorkflowStep } from "../models/WorkflowStep";

/**
 * Pure domain workflow contract.
 *
 * Implementations never talk to AI providers and never access repositories.
 * Tool execution is owned by WorkflowExecutor → ToolExecutor.
 */
export interface AIWorkflow {
  name(): string;
  description(): string;
  capabilities(): readonly WorkflowCapability[];
  /** Returns frozen validation issue codes; empty means valid. */
  validate(request: WorkflowRequest): readonly string[];
  /** Expand into ordered WorkflowSteps — planning only. */
  plan(
    request: WorkflowRequest,
    context: WorkflowContext,
  ): readonly WorkflowStep[];
  /**
   * Aggregate step ToolResults into workflow output.
   * Placeholders return local stubs — no business logic.
   */
  execute(
    request: WorkflowRequest,
    context: WorkflowContext,
    stepResults: readonly ToolResult[],
  ): Promise<unknown>;
}
