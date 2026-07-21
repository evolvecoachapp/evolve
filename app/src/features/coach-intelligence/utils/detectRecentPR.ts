import type { WorkoutRecord } from "../../records/models/WorkoutRecord";
import type { CoachInsight } from "../models/CoachInsight";
import { daysBetween } from "./math";

export interface DetectRecentPROptions {
  readonly referenceDate: Date;
  /** Consider a PR "recent" when within this many days. Default 14. */
  readonly windowDays?: number;
}

/**
 * Emit a structured recent-PR insight when the latest record falls inside
 * the lookback window.
 */
export function detectRecentPR(
  workoutRecord: WorkoutRecord,
  options: DetectRecentPROptions,
): CoachInsight | null {
  const windowDays = options.windowDays ?? 14;
  const lastRecordAt = workoutRecord.lastRecordAt;
  if (lastRecordAt == null) {
    return null;
  }

  const ageDays = daysBetween(lastRecordAt, options.referenceDate);
  if (ageDays > windowDays) {
    return null;
  }

  const confidence = Math.max(0.4, 1 - ageDays / (windowDays + 1));

  return Object.freeze({
    id: "insight:recent_pr",
    kind: "recent_pr" as const,
    confidence: Math.round(confidence * 100) / 100,
    detectedAt: options.referenceDate.toISOString(),
    payload: Object.freeze({
      lastRecordAt,
      ageDays,
      windowDays,
      bestWeightKg: workoutRecord.bestWeightKg,
      bestEstimatedOneRMKg: workoutRecord.bestEstimatedOneRMKg,
      bestSessionVolumeKg: workoutRecord.bestSessionVolumeKg,
    }),
  });
}
