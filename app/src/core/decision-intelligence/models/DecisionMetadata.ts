/**
 * Lightweight metadata tags for a domain decision.
 */
export interface DecisionMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}
