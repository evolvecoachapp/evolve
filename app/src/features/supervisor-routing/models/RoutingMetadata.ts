/**
 * Immutable routing metadata (tags + attributes only).
 */
export interface RoutingMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export const EMPTY_ROUTING_METADATA: RoutingMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string | number | boolean | null>),
});
