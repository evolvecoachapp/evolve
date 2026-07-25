/**
 * Immutable metadata bag for recommendation-engine entities.
 */
export interface RecommendationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_RECOMMENDATION_METADATA: RecommendationMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
