/**
 * Aggregated selected knowledge references for a conversation context.
 * Pointers and counts only — not narrative generation.
 */
export interface ConversationKnowledge {
  readonly coachingContextId: string;
  readonly objectiveIds: readonly string[];
  readonly objectiveCount: number;
  readonly selectedObjectiveIds: readonly string[];
  readonly insightIds: readonly string[];
  readonly recoveryReferenced: boolean;
  readonly historyReferenced: boolean;
  readonly performanceReferenced: boolean;
  readonly achievementReferenced: boolean;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
