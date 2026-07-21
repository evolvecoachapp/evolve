/** Direction of a computed training metric over a comparison window. */
export type TrendDirection =
  | "increasing"
  | "decreasing"
  | "stable"
  | "insufficient_data";

/** Metric evaluated by the coach intelligence trend detectors. */
export type TrainingTrendMetric = "volume" | "frequency" | "consistency";

/**
 * Structured training trend — no natural language.
 *
 * Derived from analytics trend series by pure detectors.
 */
export interface TrainingTrend {
  readonly metric: TrainingTrendMetric;
  readonly direction: TrendDirection;
  /**
   * Relative change between comparison windows (e.g. `0.15` = +15%).
   * `null` when there is insufficient data to compare.
   */
  readonly changeRatio: number | null;
  /** Number of UTC weeks used for the analysis window. */
  readonly windowWeeks: number;
}
