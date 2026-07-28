import type { AthleteSnapshot } from "./AthleteSnapshot";
import type { SnapshotIdentity } from "./SnapshotIdentity";
import type { SnapshotIntegrity } from "./SnapshotIntegrity";
import type { SnapshotMetadata } from "./SnapshotMetadata";

/**
 * Immutable result of building the athlete snapshot.
 */
export interface SnapshotResult {
  readonly id: string;
  readonly success: boolean;
  readonly snapshot: AthleteSnapshot | null;
  readonly identity: SnapshotIdentity | null;
  readonly metadata: SnapshotMetadata | null;
  readonly integrity: SnapshotIntegrity;
  readonly message: string;
  readonly generatedAt: string;
}
