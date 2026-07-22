/**
 * Deterministic recovery status derived from fatigue / load metrics.
 * Not a recommendation — observational classification only.
 */
export type RecoveryStatusLevel =
  | "fresh"
  | "moderate"
  | "elevated"
  | "high"
  | "insufficient_data";

export interface RecoveryStatus {
  readonly level: RecoveryStatusLevel;
  /** Fatigue score band used for classification (0–100), or null when insufficient data. */
  readonly score: number | null;
  readonly label: string;
}

export const RecoveryStatusLevels = {
  FRESH: "fresh",
  MODERATE: "moderate",
  ELEVATED: "elevated",
  HIGH: "high",
  INSUFFICIENT_DATA: "insufficient_data",
} as const satisfies Record<string, RecoveryStatusLevel>;
