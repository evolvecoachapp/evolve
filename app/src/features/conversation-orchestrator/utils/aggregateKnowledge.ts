import type { ConversationKnowledge } from "../models/ConversationKnowledge";

/**
 * Aggregate selected knowledge references into a frozen ConversationKnowledge.
 */
export function aggregateKnowledge(options: {
  readonly coachingContextId: string;
  readonly objectiveIds: readonly string[];
  readonly selectedObjectiveIds: readonly string[];
  readonly insightIds: readonly string[];
  readonly recoveryReferenced: boolean;
  readonly historyReferenced: boolean;
  readonly performanceReferenced: boolean;
  readonly achievementReferenced: boolean;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
}): ConversationKnowledge {
  return Object.freeze({
    coachingContextId: options.coachingContextId,
    objectiveIds: Object.freeze([...options.objectiveIds]),
    objectiveCount: options.objectiveIds.length,
    selectedObjectiveIds: Object.freeze([...options.selectedObjectiveIds]),
    insightIds: Object.freeze([...options.insightIds]),
    recoveryReferenced: options.recoveryReferenced,
    historyReferenced: options.historyReferenced,
    performanceReferenced: options.performanceReferenced,
    achievementReferenced: options.achievementReferenced,
    attributes: Object.freeze({ ...(options.attributes ?? {}) }),
  });
}
