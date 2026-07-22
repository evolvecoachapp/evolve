import type { ConversationContext } from "../models/ConversationContext";

/**
 * Soft-validate internal conversation context consistency.
 */
export function validateContextConsistency(
  context: ConversationContext,
): readonly string[] {
  const issues: string[] = [];

  if (context.summary.contextId !== context.id) {
    issues.push("summary_context_id_mismatch");
  }
  if (context.summary.goalCount !== context.goals.length) {
    issues.push("summary_goal_count_mismatch");
  }
  if (context.summary.constraintCount !== context.constraints.length) {
    issues.push("summary_constraint_count_mismatch");
  }
  if (context.summary.evidenceCount !== context.evidence.length) {
    issues.push("summary_evidence_count_mismatch");
  }
  if (context.summary.turnCount !== context.turns.length) {
    issues.push("summary_turn_count_mismatch");
  }
  if (context.summary.messageCount !== context.messages.length) {
    issues.push("summary_message_count_mismatch");
  }
  if (context.summary.state !== context.state) {
    issues.push("summary_state_mismatch");
  }
  if (context.summary.stage !== context.stage) {
    issues.push("summary_stage_mismatch");
  }

  if (context.preparation.coachingContextId !== context.session.coachingContextId) {
    issues.push("preparation_coaching_context_mismatch");
  }

  if (context.knowledge.coachingContextId !== context.session.coachingContextId) {
    issues.push("knowledge_coaching_context_mismatch");
  }

  if (
    context.knowledge.selectedObjectiveIds.length >
    context.knowledge.objectiveCount
  ) {
    issues.push("knowledge_selected_exceeds_total");
  }

  if (context.request.contextId !== context.id) {
    issues.push("request_context_id_mismatch");
  }

  if (context.responsePlaceholder.contextId !== context.id) {
    issues.push("response_placeholder_context_id_mismatch");
  }

  const evidenceIds = new Set(context.evidence.map((item) => item.id));
  for (const goal of context.goals) {
    for (const evidenceId of goal.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) {
        issues.push(`goal_missing_evidence_ref:${goal.id}:${evidenceId}`);
      }
    }
  }

  return issues;
}
