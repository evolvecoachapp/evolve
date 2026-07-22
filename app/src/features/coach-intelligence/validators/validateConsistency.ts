import type { CoachingContext } from "../models/CoachingContext";

/**
 * Soft-validate internal coaching context consistency.
 */
export function validateContextConsistency(
  context: CoachingContext,
): readonly string[] {
  const issues: string[] = [];

  if (context.summary.contextId !== context.id) {
    issues.push("summary_context_id_mismatch");
  }
  if (context.summary.objectiveCount !== context.objectives.length) {
    issues.push("summary_objective_count_mismatch");
  }
  if (context.summary.constraintCount !== context.constraints.length) {
    issues.push("summary_constraint_count_mismatch");
  }
  if (context.summary.instructionCount !== context.instructions.length) {
    issues.push("summary_instruction_count_mismatch");
  }
  if (context.summary.focusCount !== context.focus.length) {
    issues.push("summary_focus_count_mismatch");
  }
  if (context.summary.evidenceCount !== context.evidence.length) {
    issues.push("summary_evidence_count_mismatch");
  }

  if (context.preparation.insightSnapshotId !== context.session.insightSnapshotId) {
    issues.push("preparation_insight_snapshot_mismatch");
  }

  if (context.knowledge.selectedInsightIds.length > context.knowledge.insightCount) {
    issues.push("knowledge_selected_exceeds_total");
  }

  const evidenceIds = new Set(context.evidence.map((item) => item.id));
  for (const objective of context.objectives) {
    for (const evidenceId of objective.evidenceIds) {
      if (!evidenceIds.has(evidenceId)) {
        issues.push(`objective_missing_evidence_ref:${objective.id}:${evidenceId}`);
      }
    }
  }

  return issues;
}
