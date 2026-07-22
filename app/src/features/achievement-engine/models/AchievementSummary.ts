/**
 * Compact public summary of an achievement evaluation.
 */
export interface AchievementSummary {
  readonly evaluationId: string;
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly unlockedCount: number;
  readonly personalRecordCount: number;
  readonly categories: readonly string[];
  readonly summaryText: string;
}
