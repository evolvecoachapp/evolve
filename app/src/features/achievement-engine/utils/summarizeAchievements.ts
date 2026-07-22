import type { Achievement } from "../models/Achievement";
import type { AchievementSummary } from "../models/AchievementSummary";
import { AchievementSummaryBuilder } from "../builders/AchievementSummaryBuilder";

/**
 * Build a public summary from unlocked achievements.
 */
export function summarizeAchievementsList(
  evaluationId: string,
  sessionId: string,
  runtimeId: string,
  achievements: readonly Achievement[],
): AchievementSummary {
  return new AchievementSummaryBuilder()
    .fromAchievements(evaluationId, sessionId, runtimeId, achievements)
    .build();
}
