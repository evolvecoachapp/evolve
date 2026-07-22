import type { ToolArgument } from "../../tool-calling/models/ToolArgument";

/**
 * Provider-agnostic request for a domain workflow.
 *
 * Emitted by an AIProvider; executed only by EVOLVE (WorkflowExecutor).
 * The AI never executes workflows.
 */
export interface WorkflowRequest {
  readonly id: string;
  readonly workflowName: string;
  readonly arguments: readonly ToolArgument[];
  /** ISO-8601 timestamp. */
  readonly requestedAt: string;
}
