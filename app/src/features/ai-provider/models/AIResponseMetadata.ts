/**
 * Immutable response-level metadata bag.
 */
export interface AIResponseMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
  readonly latencyMs: number | null;
  readonly cached: boolean;
}

export const EMPTY_RESPONSE_METADATA: AIResponseMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
  latencyMs: null,
  cached: false,
});
