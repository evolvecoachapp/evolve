import type { InsightSnapshot } from "../models/InsightSnapshot";
import {
  validateCollectionConsistency,
  validateInsightConsistency,
} from "./validateConsistency";
import { validateDuplicates } from "./validateDuplicates";
import { validateEvidence } from "./validateEvidence";
import { validatePriorities } from "./validatePriorities";
import { validateSeverity } from "./validateSeverity";

/**
 * Validate full snapshot integrity (soft issues).
 */
export function validateSnapshotIntegrity(
  snapshot: InsightSnapshot,
): readonly string[] {
  const issues: string[] = [];

  if (!snapshot.id) {
    issues.push("snapshot_missing_id");
  }
  if (!snapshot.frozenAt) {
    issues.push("snapshot_missing_frozen_at");
  }
  if (!snapshot.context.generatedAt) {
    issues.push("snapshot_missing_generated_at");
  }
  if (snapshot.summary.snapshotId !== snapshot.id) {
    issues.push("summary_snapshot_id_mismatch");
  }
  if (snapshot.summary.insightCount !== snapshot.collection.count) {
    issues.push("summary_insight_count_mismatch");
  }

  issues.push(
    ...validateCollectionConsistency(snapshot.collection),
    ...validateInsightConsistency(snapshot.collection.insights),
    ...validateDuplicates(snapshot.collection.insights),
    ...validatePriorities(snapshot.collection.insights),
    ...validateSeverity(snapshot.collection.insights),
    ...validateEvidence(snapshot.collection.insights),
  );

  if (
    !snapshot.context.performanceSnapshotId ||
    !snapshot.context.achievementEvaluationId ||
    !snapshot.context.recoverySnapshotId ||
    !snapshot.context.historyId
  ) {
    issues.push("snapshot_incomplete_upstream_references");
  }

  return issues;
}
