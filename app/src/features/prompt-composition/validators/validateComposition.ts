import type { PromptCompositionInput } from "../models/PromptCompositionInput";

/**
 * Soft-validate composition input references.
 */
export function validateCompositionInput(
  input: PromptCompositionInput,
): readonly string[] {
  const issues: string[] = [];
  const conversation = input.conversationContext;

  if (!conversation.id) {
    issues.push("conversation_context_missing_id");
  }

  if (
    input.coachingContext &&
    conversation.session.coachingContextId &&
    input.coachingContext.id !== conversation.session.coachingContextId
  ) {
    issues.push("coaching_context_id_mismatch");
  }

  if (
    input.insightSnapshot &&
    conversation.session.insightSnapshotId &&
    input.insightSnapshot.id !== conversation.session.insightSnapshotId
  ) {
    issues.push("insight_snapshot_id_mismatch");
  }

  return issues;
}

/**
 * Soft-validate missing optional information.
 */
export function validateMissingInformation(
  input: PromptCompositionInput,
): readonly string[] {
  const issues: string[] = [];
  const session = input.conversationContext.session;

  if (!input.coachingContext) {
    issues.push("missing_coaching_context_reference");
  }
  if (!input.insightSnapshot && !session.insightSnapshotId) {
    issues.push("missing_insight_snapshot_reference");
  }
  if (input.conversationContext.goals.length === 0) {
    issues.push("missing_conversation_goals");
  }

  return issues;
}
