import type { ToolArgument } from "../../tool-calling/models/ToolArgument";

/**
 * Ordered unit of work within a workflow plan.
 *
 * Each step maps to exactly one ToolExecutor invocation.
 * No parallel execution in this sprint.
 */
export interface WorkflowStep {
  readonly id: string;
  readonly name: string;
  readonly toolName: string;
  readonly arguments: readonly ToolArgument[];
  /** Zero-based execution order. */
  readonly order: number;
  /**
   * When true, the step runs only when conditionKey is truthy in
   * WorkflowContext.metadata (or when omitted, when prior steps succeeded).
   */
  readonly conditional: boolean;
  readonly conditionKey?: string;
  /** Stop remaining steps after this step succeeds. */
  readonly earlyExitOnSuccess: boolean;
  /** Additional attempts after the first failure (0 = no retry). */
  readonly maxRetries: number;
}
