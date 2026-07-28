/**
 * Immutable evidence references collected from existing composed artifacts.
 */
export interface SnapshotEvidence {
  readonly athleteId: string;
  readonly workspaceId: string | null;
  readonly timelineEntryIds: readonly string[];
  readonly latestDecisionIds: readonly string[];
  readonly latestRestoreIds: readonly string[];
  readonly coachingSessionId: string | null;
  readonly coachingEvidenceItemIds: readonly string[];
  readonly coachingEvidenceKeys: readonly string[];
  readonly planVersionNumbers: readonly number[];
}
