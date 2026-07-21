import type { WorkoutTrend } from "../../analytics/models/WorkoutTrend";
import { clamp, roundToTwo } from "./math";

/**
 * Score weekly workout consistency in `[0, 1]`.
 *
 * Uses the share of weeks with at least one session, lightly penalized by
 * week-to-week variance (coefficient of variation of weekly counts).
 */
export function scoreTrainingConsistency(trend: WorkoutTrend): number {
  const points = trend.points;
  if (points.length === 0) {
    return 0;
  }

  const values = points.map((point) => point.value);
  const activeWeeks = values.filter((value) => value > 0).length;
  const coverage = activeWeeks / values.length;

  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  if (mean <= 0) {
    return 0;
  }

  const variance =
    values.reduce((acc, value) => acc + (value - mean) ** 2, 0) /
    values.length;
  const cv = Math.sqrt(variance) / mean;
  const stability = clamp(1 - cv / 2, 0, 1);

  return roundToTwo(clamp(0.7 * coverage + 0.3 * stability, 0, 1));
}
