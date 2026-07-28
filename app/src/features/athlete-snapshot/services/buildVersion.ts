import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { CoachTimeline } from "../../coach-timeline/models/CoachTimeline";
import type { AthleteWorkspace } from "../../intelligence-workspace/models/AthleteWorkspace";
import type { SnapshotVersion } from "../models/SnapshotVersion";

export interface BuildVersionInput {
  readonly snapshotVersion?: string;
  readonly workspace?: AthleteWorkspace | null;
  readonly timeline?: CoachTimeline | null;
  readonly coachingSession?: CoachingSession | null;
}

/**
 * Builds version references used to validate snapshot compatibility.
 */
export function buildVersion(input: BuildVersionInput): SnapshotVersion {
  return Object.freeze({
    snapshotVersion: input.snapshotVersion ?? "28.2",
    workspaceVersion: input.workspace?.metadata.version ?? "unavailable",
    timelineVersion: input.timeline?.updatedAt ?? "unavailable",
    coachVersion: input.coachingSession?.timestamp ?? "unavailable",
  });
}
