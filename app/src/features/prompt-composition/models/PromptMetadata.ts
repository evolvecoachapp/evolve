/**
 * Extensible frozen metadata for prompt composition artifacts.
 */
export interface PromptMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
