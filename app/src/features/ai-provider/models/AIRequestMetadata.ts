/**
 * Immutable request-level metadata bag (distinct from provider metadata).
 */
export interface AIRequestMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
  readonly correlationId: string | null;
  readonly source: string | null;
}

export const EMPTY_REQUEST_METADATA: AIRequestMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
  correlationId: null,
  source: null,
});
