import type { SnapshotCoach } from "./SnapshotCoach";
import type { SnapshotEvidence } from "./SnapshotEvidence";
import type { SnapshotIdentity } from "./SnapshotIdentity";
import type { SnapshotIntegrity } from "./SnapshotIntegrity";
import type { SnapshotMetadata } from "./SnapshotMetadata";
import type { SnapshotState } from "./SnapshotState";
import type { SnapshotTimeline } from "./SnapshotTimeline";
import type { SnapshotVersion } from "./SnapshotVersion";
import type { SnapshotWorkspace } from "./SnapshotWorkspace";

/**
 * Immutable point-in-time athlete representation composed from existing domain artifacts.
 */
export interface AthleteSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly identity: SnapshotIdentity;
  readonly state: SnapshotState;
  readonly workspace: SnapshotWorkspace;
  readonly timeline: SnapshotTimeline;
  readonly coach: SnapshotCoach;
  readonly metadata: SnapshotMetadata;
  readonly version: SnapshotVersion;
  readonly evidence: SnapshotEvidence;
  readonly integrity: SnapshotIntegrity;
}
