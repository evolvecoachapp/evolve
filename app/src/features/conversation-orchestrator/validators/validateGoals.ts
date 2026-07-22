import { ALL_CONVERSATION_INTENTS } from "../models/ConversationIntent";
import type { ConversationGoal } from "../models/ConversationGoal";

/**
 * Soft-validate conversation goals.
 */
export function validateGoals(
  goals: readonly ConversationGoal[],
): readonly string[] {
  const issues: string[] = [];
  const seen = new Set<string>();

  for (const goal of goals) {
    if (!goal.id) {
      issues.push("goal_missing_id");
      continue;
    }
    if (seen.has(goal.id)) {
      issues.push(`goal_duplicate_id:${goal.id}`);
    }
    seen.add(goal.id);

    if (!goal.title) {
      issues.push(`goal_missing_title:${goal.id}`);
    }
    if (!goal.statement) {
      issues.push(`goal_missing_statement:${goal.id}`);
    }
    if (!ALL_CONVERSATION_INTENTS.includes(goal.intent)) {
      issues.push(`goal_invalid_intent:${goal.id}`);
    }
    if (!goal.reason?.code) {
      issues.push(`goal_missing_reason:${goal.id}`);
    }
  }

  return issues;
}
