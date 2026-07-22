import type { Achievement } from "../models/Achievement";
import type { AchievementSummary } from "../models/AchievementSummary";
import { freezeSummary } from "../utils/freezeResults";

/**
 * Fluent builder for immutable AchievementSummary.
 */
export class AchievementSummaryBuilder {
  private evaluationId = "";
  private sessionId = "";
  private runtimeId = "";
  private unlockedCount = 0;
  private personalRecordCount = 0;
  private categories: readonly string[] = [];
  private summaryText = "";

  withIds(ids: {
    readonly evaluationId: string;
    readonly sessionId: string;
    readonly runtimeId: string;
  }): this {
    this.evaluationId = ids.evaluationId;
    this.sessionId = ids.sessionId;
    this.runtimeId = ids.runtimeId;
    return this;
  }

  withCounts(counts: {
    readonly unlockedCount: number;
    readonly personalRecordCount: number;
  }): this {
    this.unlockedCount = counts.unlockedCount;
    this.personalRecordCount = counts.personalRecordCount;
    return this;
  }

  withCategories(categories: readonly string[]): this {
    this.categories = categories;
    return this;
  }

  withSummaryText(summaryText: string): this {
    this.summaryText = summaryText;
    return this;
  }

  fromAchievements(
    evaluationId: string,
    sessionId: string,
    runtimeId: string,
    achievements: readonly Achievement[],
  ): this {
    const unlocked = achievements.filter((a) => a.status === "unlocked");
    const categories = Object.freeze([
      ...new Set(unlocked.map((a) => a.category)),
    ]);
    const personalRecordCount = unlocked.filter(
      (a) => a.type === "personal_record",
    ).length;

    this.evaluationId = evaluationId;
    this.sessionId = sessionId;
    this.runtimeId = runtimeId;
    this.unlockedCount = unlocked.length;
    this.personalRecordCount = personalRecordCount;
    this.categories = categories;
    this.summaryText =
      unlocked.length === 0
        ? "No achievements unlocked"
        : `${unlocked.length} achievement${unlocked.length === 1 ? "" : "s"} unlocked (${personalRecordCount} personal record${personalRecordCount === 1 ? "" : "s"})`;
    return this;
  }

  build(): AchievementSummary {
    if (!this.evaluationId || !this.sessionId || !this.runtimeId) {
      throw new Error("AchievementSummaryBuilder missing required fields");
    }

    return freezeSummary({
      evaluationId: this.evaluationId,
      sessionId: this.sessionId,
      runtimeId: this.runtimeId,
      unlockedCount: this.unlockedCount,
      personalRecordCount: this.personalRecordCount,
      categories: Object.freeze([...this.categories]),
      summaryText: this.summaryText,
    });
  }
}
