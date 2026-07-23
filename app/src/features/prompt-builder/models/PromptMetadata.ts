/**
 * Extensible frozen metadata for Prompt Builder artifacts.
 */
export interface PromptMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
