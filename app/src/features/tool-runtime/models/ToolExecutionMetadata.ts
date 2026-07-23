/**
 * Immutable metadata for Tool Runtime execution artifacts.
 */
export interface ToolExecutionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly sourcePlanId: string | null;
  readonly runtimeId: string | null;
  readonly notes: string | null;
}

export const EMPTY_TOOL_EXECUTION_METADATA: ToolExecutionMetadata =
  Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
    sourcePlanId: null,
    runtimeId: null,
    notes: null,
  });
