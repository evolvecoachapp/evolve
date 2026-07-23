import type { ToolCallRequest } from "./ToolCallRequest";
import type { ToolCallResponse } from "./ToolCallResponse";
import type { ToolDescriptor } from "./ToolDescriptor";
import type { ToolExecution } from "./ToolExecution";
import type { ToolExecutionResult } from "./ToolExecutionResult";

/**
 * Immutable result returned by ToolCallingEngine.
 *
 * Public application API maps this to consumers without exposing engine internals.
 */
export interface ToolEngineResult {
  readonly request: ToolCallRequest;
  readonly response: ToolCallResponse;
  readonly execution: ToolExecution;
  readonly result: ToolExecutionResult;
  readonly descriptor: ToolDescriptor | null;
  readonly validationIssues: readonly string[];
}
