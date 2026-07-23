/**
 * Immutable stream metadata (tags + attributes).
 */
export interface StreamMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export const EMPTY_STREAM_METADATA: StreamMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
});
