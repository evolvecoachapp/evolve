import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import { validateAssessmentConsistency } from "./validateAssessment";
import { validateMetricConsistency } from "./validateMetricConsistency";
import { validateRecoveryWindow } from "./validateRecoveryWindow";
import { validateSnapshotTimestamps } from "./validateTimestamps";

/**
 * Validate full snapshot integrity.
 */
export function validateSnapshotIntegrity(
  snapshot: RecoverySnapshot,
): readonly string[] {
  const issues: string[] = [];

  if (!snapshot.id) {
    issues.push("snapshot_missing_id");
  }
  if (snapshot.summary.snapshotId !== snapshot.id) {
    issues.push("summary_snapshot_id_mismatch");
  }
  if (snapshot.summary.status !== snapshot.metrics.status.level) {
    issues.push("summary_status_mismatch");
  }
  if (snapshot.summary.fatigueScore !== snapshot.metrics.fatigue.score) {
    issues.push("summary_fatigue_mismatch");
  }
  if (
    snapshot.context.performanceSnapshotId === null ||
    snapshot.context.performanceSnapshotId === ""
  ) {
    issues.push("context_missing_performance_snapshot_id");
  }

  return Object.freeze([
    ...new Set([
      ...issues,
      ...validateMetricConsistency(snapshot.metrics),
      ...validateRecoveryWindow(snapshot.metrics.recoveryWindow),
      ...validateSnapshotTimestamps(snapshot),
      ...validateAssessmentConsistency(
        snapshot.assessment,
        snapshot.metrics,
      ),
    ]),
  ]);
}
