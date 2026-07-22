import type { Achievement } from "../../achievement-engine/models/Achievement";
import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AchievementHistoryEntry } from "../models/AchievementHistoryEntry";
import type { HistoryContext } from "../models/HistoryContext";
import { HistoryEntryCategories } from "../models/HistoryEntryCategory";
import { HistoryEntryTypes } from "../models/HistoryEntryType";
import { freezeAchievementHistoryEntry } from "../utils/freezeHistory";

/**
 * Aggregate AchievementResult unlocked achievements into history entries.
 * One responsibility: achievements → history entries.
 */
export class AchievementAggregator {
  aggregate(
    achievementResult: AchievementResult,
    context: HistoryContext,
    frozenAt: string,
  ): readonly AchievementHistoryEntry[] {
    const unlocked = achievementResult.achievements.filter(
      (a) => a.status === "unlocked",
    );

    return Object.freeze(
      unlocked.map((achievement) =>
        this.fromAchievement(achievement, achievementResult, context, frozenAt),
      ),
    );
  }

  private fromAchievement(
    achievement: Achievement,
    achievementResult: AchievementResult,
    context: HistoryContext,
    frozenAt: string,
  ): AchievementHistoryEntry {
    return freezeAchievementHistoryEntry({
      id: `hist:achievement:${achievement.id}`,
      type: HistoryEntryTypes.ACHIEVEMENT,
      category: HistoryEntryCategories.ACHIEVEMENT,
      occurredAt: achievement.unlockedAt,
      title: achievement.title,
      description: achievement.description,
      references: Object.freeze([
        Object.freeze({
          kind: "achievement",
          id: achievement.id,
          label: achievement.title,
        }),
        Object.freeze({
          kind: "achievement_evaluation",
          id: achievementResult.evaluationId,
          label: "AchievementResult",
        }),
        Object.freeze({
          kind: "performance_snapshot",
          id: achievementResult.performanceSnapshotId,
          label: "PerformanceSnapshot",
        }),
        Object.freeze({
          kind: "workout_session",
          id: achievementResult.sessionId,
          label: "WorkoutSession",
        }),
      ]),
      evidence: Object.freeze({
        sourceType: "Achievement",
        sourceId: achievement.id,
        attributes: Object.freeze({
          achievementType: achievement.type,
          achievementCategory: achievement.category,
          level: achievement.level,
          reason: achievement.reason,
        }),
      }),
      context,
      metadata: Object.freeze({
        tags: Object.freeze([
          "achievement",
          achievement.type,
          achievement.category,
        ]),
        attributes: Object.freeze({
          achievementId: achievement.id,
          evaluationId: achievementResult.evaluationId,
        }),
      }),
      frozenAt,
      achievementId: achievement.id,
      achievementType: achievement.type,
      achievementCategory: achievement.category,
    });
  }
}

export function createAchievementAggregator(): AchievementAggregator {
  return new AchievementAggregator();
}
