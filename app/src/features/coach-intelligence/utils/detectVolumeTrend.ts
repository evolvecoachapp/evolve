import type { WorkoutTrend } from "../../analytics/models/WorkoutTrend";
import type { TrainingTrend } from "../models/TrainingTrend";
import { roundToTwo } from "./math";

export interface DetectTrendOptions {
  /** Relative change below this absolute value is treated as stable. Default 0.05. */
  readonly stableThreshold?: number;
  /** Minimum non-zero weeks required before classifying a direction. Default 2. */
  readonly minActiveWeeks?: number;
}

function sum(values: readonly number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

/**
 * Compare the newer half of a trend series to the older half.
 * Returns a structured `TrainingTrend` — never prose.
 */
export function detectVolumeTrend(
  trend: WorkoutTrend,
  options: DetectTrendOptions = {},
): TrainingTrend {
  return classifyTrend(trend, "volume", options);
}

/**
 * Compare newer vs older weekly workout frequency.
 */
export function detectFrequencyTrend(
  trend: WorkoutTrend,
  options: DetectTrendOptions = {},
): TrainingTrend {
  return classifyTrend(trend, "frequency", options);
}

function classifyTrend(
  trend: WorkoutTrend,
  metric: TrainingTrend["metric"],
  options: DetectTrendOptions,
): TrainingTrend {
  const stableThreshold = options.stableThreshold ?? 0.05;
  const minActiveWeeks = options.minActiveWeeks ?? 2;
  const points = trend.points;
  const windowWeeks = points.length;

  if (windowWeeks < 2) {
    return Object.freeze({
      metric,
      direction: "insufficient_data" as const,
      changeRatio: null,
      windowWeeks,
    });
  }

  const activeWeeks = points.filter((point) => point.value > 0).length;
  if (activeWeeks < minActiveWeeks) {
    return Object.freeze({
      metric,
      direction: "insufficient_data" as const,
      changeRatio: null,
      windowWeeks,
    });
  }

  const split = Math.floor(windowWeeks / 2);
  const older = points.slice(0, split).map((point) => point.value);
  const newer = points.slice(split).map((point) => point.value);
  const olderAvg = older.length === 0 ? 0 : sum(older) / older.length;
  const newerAvg = newer.length === 0 ? 0 : sum(newer) / newer.length;

  let changeRatio: number | null;
  if (olderAvg === 0 && newerAvg === 0) {
    changeRatio = 0;
  } else if (olderAvg === 0) {
    changeRatio = 1;
  } else {
    changeRatio = roundToTwo((newerAvg - olderAvg) / olderAvg);
  }

  let direction: TrainingTrend["direction"];
  if (changeRatio == null) {
    direction = "insufficient_data";
  } else if (Math.abs(changeRatio) < stableThreshold) {
    direction = "stable";
  } else if (changeRatio > 0) {
    direction = "increasing";
  } else {
    direction = "decreasing";
  }

  return Object.freeze({
    metric,
    direction,
    changeRatio,
    windowWeeks,
  });
}
