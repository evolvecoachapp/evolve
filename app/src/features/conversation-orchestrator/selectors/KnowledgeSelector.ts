import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { ConversationKnowledge } from "../models/ConversationKnowledge";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";

export interface KnowledgeSelection {
  readonly knowledge: ConversationKnowledge;
  readonly objectiveIds: readonly string[];
  readonly selectedObjectiveIds: readonly string[];
}

/**
 * Aggregates coaching knowledge references for conversation context.
 * One responsibility: knowledge aggregation only.
 */
export class KnowledgeSelector {
  select(coachingContext: CoachingContext): KnowledgeSelection {
    const objectiveIds = coachingContext.objectives.map(
      (objective) => objective.id,
    );
    const selectedObjectiveIds = objectiveIds.slice(0, 5);
    const insightIds = coachingContext.knowledge.selectedInsightIds;

    const knowledge = aggregateKnowledge({
      coachingContextId: coachingContext.id,
      objectiveIds,
      selectedObjectiveIds,
      insightIds,
      recoveryReferenced: coachingContext.knowledge.recoveryReferenced,
      historyReferenced: coachingContext.knowledge.historyReferenced,
      performanceReferenced: coachingContext.knowledge.performanceReferenced,
      achievementReferenced: coachingContext.knowledge.achievementReferenced,
      attributes: Object.freeze({
        coachingAudience: coachingContext.audience,
        instructionCount: coachingContext.instructions.length,
      }),
    });

    return Object.freeze({
      knowledge,
      objectiveIds: Object.freeze([...objectiveIds]),
      selectedObjectiveIds: Object.freeze([...selectedObjectiveIds]),
    });
  }
}

export function createKnowledgeSelector(): KnowledgeSelector {
  return new KnowledgeSelector();
}
