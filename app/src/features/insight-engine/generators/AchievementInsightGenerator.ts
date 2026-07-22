import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import { InsightBuilder } from "../builders/InsightBuilder";
import type { Insight } from "../models/Insight";
import { InsightCategories } from "../models/InsightCategory";
import { InsightSeverities } from "../models/InsightSeverity";
import { InsightTypes } from "../models/InsightType";

export interface AchievementInsightGenerator {
  generate(options: {
    readonly achievementResult: AchievementResult;
    readonly generatedAt: string;
  }): readonly Insight[];
}

/**
 * Emits deterministic achievement facts from an AchievementResult.
 */
export class DefaultAchievementInsightGenerator
  implements AchievementInsightGenerator
{
  generate(options: {
    readonly achievementResult: AchievementResult;
    readonly generatedAt: string;
  }): readonly Insight[] {
    const { achievementResult: result, generatedAt } = options;
    const insights: Insight[] = [];

    insights.push(
      new InsightBuilder()
        .withId(`insight:ach:unlocked:${result.evaluationId}`)
        .withType(InsightTypes.ACHIEVEMENT)
        .withCategory(InsightCategories.ACHIEVEMENT_COUNT)
        .withSeverity(
          result.unlockedCount > 0
            ? InsightSeverities.NOTABLE
            : InsightSeverities.INFO,
        )
        .withPriority(result.unlockedCount > 0 ? 75 : 40)
        .withTitle("Achievements unlocked")
        .withStatement(
          `Unlocked achievement count is ${result.unlockedCount}.`,
        )
        .withReason({
          code: "achievement_unlock_count_observed",
          statement: "Count taken from AchievementResult.unlockedCount",
          attributes: Object.freeze({ unlockedCount: result.unlockedCount }),
        })
        .withEvidence({
          sourceType: "AchievementResult",
          sourceId: result.evaluationId,
          attributes: Object.freeze({
            unlockedCount: result.unlockedCount,
            achievementCount: result.achievements.length,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["achievement", "count"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    const prCount = result.personalRecords.length;
    insights.push(
      new InsightBuilder()
        .withId(`insight:ach:pr:${result.evaluationId}`)
        .withType(InsightTypes.ACHIEVEMENT)
        .withCategory(InsightCategories.PERSONAL_RECORD)
        .withSeverity(
          prCount > 0 ? InsightSeverities.NOTABLE : InsightSeverities.INFO,
        )
        .withPriority(prCount > 0 ? 80 : 35)
        .withTitle("Personal records detected")
        .withStatement(`Personal record count is ${prCount}.`)
        .withReason({
          code: "personal_record_count_observed",
          statement: "Count taken from AchievementResult.personalRecords",
          attributes: Object.freeze({ personalRecordCount: prCount }),
        })
        .withEvidence({
          sourceType: "AchievementResult",
          sourceId: result.evaluationId,
          attributes: Object.freeze({
            personalRecordCount: prCount,
            performanceSnapshotId: result.performanceSnapshotId,
          }),
        })
        .withMetadata({
          tags: Object.freeze(["achievement", "personal_record"]),
          attributes: Object.freeze({}),
        })
        .withGeneratedAt(generatedAt)
        .withFrozenAt(generatedAt)
        .build(),
    );

    return Object.freeze(insights);
  }
}

export function createAchievementInsightGenerator(): AchievementInsightGenerator {
  return new DefaultAchievementInsightGenerator();
}
