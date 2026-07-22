/**
 * Aggregated selected knowledge references for a coaching context.
 * Pointers and counts only — not narrative generation.
 */
export interface CoachKnowledge {
  readonly insightIds: readonly string[];
  readonly insightCount: number;
  readonly selectedInsightIds: readonly string[];
  readonly recoveryReferenced: boolean;
  readonly historyReferenced: boolean;
  readonly performanceReferenced: boolean;
  readonly achievementReferenced: boolean;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
