/**
 * Extensible metadata bag for history domain objects.
 */
export interface HistoryMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
}
