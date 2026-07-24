/**
 * Immutable stress representation.
 */
export interface StressState {
  readonly label: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
