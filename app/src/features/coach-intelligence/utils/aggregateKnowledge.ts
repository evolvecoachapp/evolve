import type { CoachKnowledge } from "../models/CoachKnowledge";

/**
 * Aggregate selected knowledge references into a frozen CoachKnowledge.
 */
export function aggregateKnowledge(options: {
  readonly insightIds: readonly string[];
  readonly selectedInsightIds: readonly string[];
  readonly recoveryReferenced: boolean;
  readonly historyReferenced: boolean;
  readonly performanceReferenced: boolean;
  readonly achievementReferenced: boolean;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
}): CoachKnowledge {
  return Object.freeze({
    insightIds: Object.freeze([...options.insightIds]),
    insightCount: options.insightIds.length,
    selectedInsightIds: Object.freeze([...options.selectedInsightIds]),
    recoveryReferenced: options.recoveryReferenced,
    historyReferenced: options.historyReferenced,
    performanceReferenced: options.performanceReferenced,
    achievementReferenced: options.achievementReferenced,
    attributes: Object.freeze({ ...(options.attributes ?? {}) }),
  });
}
