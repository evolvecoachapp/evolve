/**
 * Immutable body measurements (no calculations).
 */
export interface BodyMeasurements {
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly waistCm: number | null;
  readonly chestCm: number | null;
  readonly hipsCm: number | null;
  readonly recordedAt: string | null;
}
