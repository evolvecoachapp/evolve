import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { AchievementContext } from "../models/AchievementContext";
import type { PersonalRecord } from "../models/PersonalRecord";
import type { PersonalRecordBaselineProvider } from "../models/PersonalRecordBaseline";

/**
 * Shared input for Personal Record detectors.
 */
export interface PersonalRecordDetectionInput {
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly workoutResult: WorkoutResult;
  readonly baselineProvider: PersonalRecordBaselineProvider;
  readonly context: AchievementContext;
  readonly evaluatedAt: string;
}

/**
 * One-responsibility Personal Record detector.
 */
export interface PersonalRecordDetector {
  readonly id: string;
  detect(input: PersonalRecordDetectionInput): readonly PersonalRecord[];
}
