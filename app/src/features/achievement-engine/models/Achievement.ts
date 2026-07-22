import type { AchievementCategory } from "./AchievementCategory";
import type { AchievementContext } from "./AchievementContext";
import type { AchievementEvidence } from "./AchievementEvidence";
import type { AchievementLevel } from "./AchievementLevel";
import type { AchievementMetadata } from "./AchievementMetadata";
import type { AchievementReason } from "./AchievementReason";
import type { AchievementRule } from "./AchievementRule";
import type { AchievementStatus } from "./AchievementStatus";
import type { AchievementType } from "./AchievementType";

/**
 * Immutable domain achievement.
 * Future categories extend via type/category strings — core shape stays stable.
 */
export interface Achievement {
  readonly id: string;
  readonly type: AchievementType;
  readonly category: AchievementCategory;
  readonly level: AchievementLevel;
  readonly status: AchievementStatus;
  readonly title: string;
  readonly description: string;
  readonly reason: AchievementReason;
  readonly rule: AchievementRule;
  readonly evidence: AchievementEvidence;
  readonly context: AchievementContext;
  readonly metadata: AchievementMetadata;
  readonly unlockedAt: string;
  readonly frozenAt: string;
}
