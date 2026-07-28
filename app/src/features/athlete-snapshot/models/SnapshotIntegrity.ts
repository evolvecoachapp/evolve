/**
 * Immutable integrity validation result for an athlete snapshot.
 */
export interface SnapshotIntegrity {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
