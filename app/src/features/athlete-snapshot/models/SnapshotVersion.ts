/**
 * Immutable version envelope for snapshot compatibility checks.
 */
export interface SnapshotVersion {
  readonly snapshotVersion: string;
  readonly workspaceVersion: string;
  readonly timelineVersion: string;
  readonly coachVersion: string;
}
