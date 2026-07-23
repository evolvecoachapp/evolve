/**
 * Immutable execution metadata (tags + attributes).
 */
export interface AIExecutionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export const EMPTY_EXECUTION_METADATA: AIExecutionMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
});
