import type { SnapshotCoach } from "../models/SnapshotCoach";
import type { SnapshotEvidence } from "../models/SnapshotEvidence";
import type { SnapshotTimeline } from "../models/SnapshotTimeline";
import type { SnapshotWorkspace } from "../models/SnapshotWorkspace";

export interface BuildEvidenceInput {
  readonly athleteId: string;
  readonly workspace: SnapshotWorkspace;
  readonly timeline: SnapshotTimeline;
  readonly coach: SnapshotCoach;
}

/**
 * Collects evidence references only from already-composed artifacts.
 */
export function buildEvidence(input: BuildEvidenceInput): SnapshotEvidence {
  const evidence = input.coach.evidence;

  return Object.freeze({
    athleteId: input.athleteId,
    workspaceId: input.workspace.workspaceId,
    timelineEntryIds: Object.freeze(
      (input.timeline.timeline?.entries ?? []).map((entry) => entry.id),
    ),
    latestDecisionIds: Object.freeze(
      input.timeline.latestDecisions.map((entry) => entry.id),
    ),
    latestRestoreIds: Object.freeze(
      input.timeline.latestRestores.map((entry) => entry.id),
    ),
    coachingSessionId: input.coach.sessionId,
    coachingEvidenceItemIds: Object.freeze(
      (evidence?.items ?? []).map((item) => item.id),
    ),
    coachingEvidenceKeys: Object.freeze([...(evidence?.keys ?? [])]),
    planVersionNumbers: Object.freeze([...(evidence?.planVersionNumbers ?? [])]),
  });
}
