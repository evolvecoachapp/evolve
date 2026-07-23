export interface PromptKnowledge {
  readonly id: string;
  readonly coachingContextId: string | null;
  readonly conversationContextId: string;
  readonly objectiveIds: readonly string[];
  readonly insightIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly knowledgeRefs: readonly string[];
  readonly recoveryReferenced: boolean;
  readonly historyReferenced: boolean;
  readonly performanceReferenced: boolean;
  readonly achievementReferenced: boolean;
  readonly statement: string;
}
