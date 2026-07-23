/** Immutable metadata attached to tool calls / executions. */
export interface ToolExecutionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, unknown>>;
  readonly version: string | null;
}

export const EMPTY_TOOL_EXECUTION_METADATA: ToolExecutionMetadata =
  Object.freeze({
    tags: Object.freeze([]),
    attributes: Object.freeze({}),
    version: null,
  });
