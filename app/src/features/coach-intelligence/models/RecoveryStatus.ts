/** Estimated recovery / fatigue band from recent training load. */
export type RecoveryLevel =
  | "recovered"
  | "moderate"
  | "elevated"
  | "high"
  | "unknown";

/**
 * Structured recovery assessment — no natural language.
 */
export interface RecoveryStatus {
  readonly level: RecoveryLevel;
  /** Whole days since the most recent completed session. `null` when empty. */
  readonly daysSinceLastSession: number | null;
  /**
   * Estimated fatigue score in `[0, 1]` (higher = more fatigued).
   * `null` when history is insufficient.
   */
  readonly fatigueScore: number | null;
}
