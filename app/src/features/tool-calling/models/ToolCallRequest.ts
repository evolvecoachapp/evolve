import type { ToolCall } from "./ToolCall";
import type { ToolExecutionContext } from "./ToolExecutionContext";
import type { ToolExecutionMetadata } from "./ToolExecutionMetadata";

/**
 * Immutable request wrapping a ToolCall for the Tool Calling Engine.
 *
 * Optionally links to Streaming Foundation / AI Execution Pipeline ids.
 */
export interface ToolCallRequest {
  readonly id: string;
  readonly call: ToolCall;
  readonly context: ToolExecutionContext;
  readonly metadata: ToolExecutionMetadata;
  readonly createdAt: string;
}
