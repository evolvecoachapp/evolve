import type { CoachContextSnapshot } from "../models/CoachContextSnapshot";
import { validateConstraints } from "./validateConstraints";
import { validateContextConsistency } from "./validateConsistency";
import { validateEvidence } from "./validateEvidence";
import { validateObjectives } from "./validateObjectives";
import { validatePriorities } from "./validatePriorities";

/**
 * Validate full snapshot integrity (soft issues).
 */
export function validateSnapshotIntegrity(
  snapshot: CoachContextSnapshot,
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
  if (!snapshot.context.session.insightSnapshotId) {
    issues.push("snapshot_missing_insight_reference");
  }
  if (!snapshot.context.frozenAt) {
    issues.push("context_missing_frozen_at");
  }

  issues.push(
    ...validateContextConsistency(snapshot.context),
    ...validateObjectives(snapshot.context.objectives),
    ...validateConstraints(snapshot.context.constraints),
    ...validateEvidence(snapshot.context.evidence),
    ...validatePriorities({
      objectives: snapshot.context.objectives,
      constraints: snapshot.context.constraints,
      instructions: snapshot.context.instructions,
      focus: snapshot.context.focus,
      evidence: snapshot.context.evidence,
    }),
  );

  return issues;
}
