import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import { validateConstraints } from "./validateConstraints";
import { validateContextConsistency } from "./validateConsistency";
import { validateGoals } from "./validateGoals";
import { validateKnowledge } from "./validateKnowledge";
import { validatePriorities } from "./validatePriorities";

/**
 * Validate full snapshot integrity (soft issues).
 */
export function validateSnapshotIntegrity(
  snapshot: ConversationSnapshot,
): readonly string[] {
  const issues: string[] = [];

  if (!snapshot.id) {
    issues.push("snapshot_missing_id");
  }
  if (!snapshot.frozenAt) {
    issues.push("snapshot_missing_frozen_at");
  }
  if (!snapshot.context.id) {
    issues.push("context_missing_id");
  }
  if (snapshot.summary.contextId !== snapshot.context.id) {
    issues.push("snapshot_summary_context_id_mismatch");
  }
  if (!snapshot.context.session.coachingContextId) {
    issues.push("snapshot_missing_coaching_reference");
  }
  if (!snapshot.context.frozenAt) {
    issues.push("context_missing_frozen_at");
  }

  issues.push(
    ...validateContextConsistency(snapshot.context),
    ...validateGoals(snapshot.context.goals),
    ...validateConstraints(snapshot.context.constraints),
    ...validateKnowledge(snapshot.context.knowledge),
    ...validatePriorities({
      goals: snapshot.context.goals,
      constraints: snapshot.context.constraints,
      evidence: snapshot.context.evidence,
      messages: snapshot.context.messages,
      turns: snapshot.context.turns,
    }),
  );

  return issues;
}
