/**
 * Immutable metadata bag for Nutrition Agent artifacts.
 */
export interface NutritionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

export const EMPTY_NUTRITION_METADATA: NutritionMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}) as Readonly<
    Record<string, string | number | boolean | null>
  >,
});

/** Alias matching Workout Agent naming for metadata on agent descriptors. */
export type NutritionAgentMetadata = NutritionMetadata;
export const EMPTY_NUTRITION_AGENT_METADATA = EMPTY_NUTRITION_METADATA;
