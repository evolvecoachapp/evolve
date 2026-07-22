/**
 * Extensible metadata tags/attributes on an insight.
 */
export interface InsightMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
