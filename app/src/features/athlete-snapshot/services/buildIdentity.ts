import type { SnapshotIdentity } from "../models/SnapshotIdentity";

export interface BuildIdentityInput {
  readonly athleteId: string;
  readonly createdAt: string;
}

/**
 * Builds deterministic identity for the immutable athlete snapshot.
 */
export function buildIdentity(input: BuildIdentityInput): SnapshotIdentity {
  return Object.freeze({
    athleteId: input.athleteId,
    snapshotId: `athlete-snapshot:${input.athleteId}:${input.createdAt}`,
    createdAt: input.createdAt,
  });
}
