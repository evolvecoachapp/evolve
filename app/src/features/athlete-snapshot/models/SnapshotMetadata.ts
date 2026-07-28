/**
 * Immutable metadata for a point-in-time athlete snapshot.
 */
export interface SnapshotMetadata {
  readonly generatedAt: string;
  readonly weekStart: string;
  readonly weekEnd: string;
  readonly applicationVersion: string;
  readonly schemaVersion: string;
}
