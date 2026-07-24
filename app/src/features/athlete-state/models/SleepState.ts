/**
 * Immutable sleep representation.
 */
export interface SleepState {
  readonly lastNightHours: number | null;
  readonly qualityLabel: string | null;
  readonly reportedAt: string | null;
  readonly notes: readonly string[];
}
