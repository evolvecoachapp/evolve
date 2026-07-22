/**
 * Extensible frozen metadata for coaching context items.
 */
export interface CoachMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
