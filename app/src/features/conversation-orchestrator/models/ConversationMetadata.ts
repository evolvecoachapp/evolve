/**
 * Extensible frozen metadata for conversation context items.
 */
export interface ConversationMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
