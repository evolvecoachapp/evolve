/**
 * Deterministic density-derived load from single-session performance density.
 */
export interface DensityLoad {
  readonly durationMs: number;
  readonly durationMinutes: number;
  readonly tonnagePerMinute: number | null;
  readonly setsPerMinute: number | null;
  readonly repetitionsPerMinute: number | null;
  /** 0–100 density component used by fatigue aggregation. */
  readonly densityScore: number;
}
