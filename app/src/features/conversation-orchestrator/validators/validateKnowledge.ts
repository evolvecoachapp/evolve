import type { ConversationKnowledge } from "../models/ConversationKnowledge";

/**
 * Soft-validate conversation knowledge aggregation.
 */
export function validateKnowledge(
  knowledge: ConversationKnowledge,
): readonly string[] {
  const issues: string[] = [];

  if (!knowledge.coachingContextId) {
    issues.push("knowledge_missing_coaching_context_id");
  }
  if (knowledge.objectiveCount !== knowledge.objectiveIds.length) {
    issues.push("knowledge_objective_count_mismatch");
  }
  if (knowledge.selectedObjectiveIds.length > knowledge.objectiveIds.length) {
    issues.push("knowledge_selected_exceeds_objectives");
  }

  const objectiveSet = new Set(knowledge.objectiveIds);
  for (const id of knowledge.selectedObjectiveIds) {
    if (!objectiveSet.has(id)) {
      issues.push(`knowledge_selected_unknown_objective:${id}`);
    }
  }

  return issues;
}
