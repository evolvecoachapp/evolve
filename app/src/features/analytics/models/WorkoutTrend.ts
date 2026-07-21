/** Supported trend metrics prepared for future charts / dashboards. */
export type WorkoutTrendMetric =
  | "volume"
  | "workout_frequency"
  | "exercise_frequency";

/** A single point on a trend series (one UTC week). */
export interface WorkoutTrendPoint {
  /** ISO-8601 date (YYYY-MM-DD) of the UTC Monday starting this week. */
  readonly periodStart: string;
  readonly value: number;
}

/**
 * Ordered trend series for volume, workout frequency, or exercise frequency.
 *
 * Points are chronological (oldest → newest). Empty when there is no history
 * and no requested week window to fill.
 */
export interface WorkoutTrend {
  readonly metric: WorkoutTrendMetric;
  readonly points: readonly WorkoutTrendPoint[];
}
