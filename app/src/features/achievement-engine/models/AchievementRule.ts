import type { AchievementCategory } from "./AchievementCategory";
import type { AchievementType } from "./AchievementType";

/**
 * Immutable rule descriptor that produced an achievement.
 * Rule ids are open-ended so future detectors can register new rules.
 */
export interface AchievementRule {
  readonly id: string;
  readonly type: AchievementType;
  readonly category: AchievementCategory;
  readonly description: string;
  /** Comparison operator used against historical baseline. */
  readonly comparison: "greater_than";
  /** Metric key compared (detector-specific). */
  readonly metricKey: string;
}
