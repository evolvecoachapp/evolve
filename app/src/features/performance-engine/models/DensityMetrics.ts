/**
 * Single-session density — work relative to execution duration.
 * Rates are null when duration is zero/unknown (no division by zero).
 */
export interface DensityMetrics {
  /** Execution duration in milliseconds. */
  readonly durationMs: number;
  readonly durationMinutes: number;
  /** Tonnage per minute of work. */
  readonly tonnagePerMinute: number | null;
  readonly setsPerMinute: number | null;
  readonly repetitionsPerMinute: number | null;
}
