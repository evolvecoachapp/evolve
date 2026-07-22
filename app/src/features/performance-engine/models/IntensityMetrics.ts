/**
 * Single-session intensity metrics from recorded set performance.
 * Null averages when no samples exist (avoids division by zero).
 */
export interface IntensityMetrics {
  readonly averageWeight: number | null;
  readonly averageRepetitions: number | null;
  readonly averageRpe: number | null;
  readonly averageRir: number | null;
  readonly maxWeight: number | null;
  readonly maxRpe: number | null;
  readonly weightSampleCount: number;
  readonly rpeSampleCount: number;
  readonly rirSampleCount: number;
}
