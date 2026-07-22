/**
 * Immutable provider metadata tags / attributes.
 */
export interface AIProviderMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean | null>>;
}

export const EMPTY_PROVIDER_METADATA: AIProviderMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({}),
});
