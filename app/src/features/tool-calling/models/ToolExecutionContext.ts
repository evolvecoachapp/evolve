/**
 * Immutable execution context for a tool call.
 *
 * Never carries provider secrets or networking handles.
 */
export interface ToolExecutionContext {
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly streamId: string | null;
  readonly executionRequestId: string | null;
  readonly now: string;
  readonly attributes: Readonly<Record<string, unknown>>;
}

export const EMPTY_TOOL_EXECUTION_CONTEXT: ToolExecutionContext = Object.freeze({
  conversationId: null,
  athleteId: null,
  streamId: null,
  executionRequestId: null,
  now: "",
  attributes: Object.freeze({}),
});
