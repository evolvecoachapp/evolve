import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";

/**
 * Immutable dispatch routing context.
 */
export interface DispatchContext {
  readonly requestId: string;
  readonly executionContext: ToolExecutionContext;
  readonly step: ToolExecutionStep;
  readonly attempt: number;
  readonly createdAt: string;
}
