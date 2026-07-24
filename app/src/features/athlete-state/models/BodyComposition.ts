/**
 * Immutable body composition facts (no calculations).
 */
export interface BodyComposition {
  readonly bodyFatPercent: number | null;
  readonly leanMassKg: number | null;
  readonly fatMassKg: number | null;
  readonly recordedAt: string | null;
}
