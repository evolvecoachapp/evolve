/**
 * Immutable point-in-time snapshot identity.
 */
export interface SnapshotIdentity {
  readonly athleteId: string;
  readonly snapshotId: string;
  readonly createdAt: string;
}
