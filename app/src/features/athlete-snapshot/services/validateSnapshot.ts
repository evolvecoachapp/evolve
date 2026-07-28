import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { SnapshotIntegrity } from "../models/SnapshotIntegrity";
import { validateIntegrity } from "./validateIntegrity";

/**
 * Validates the immutable athlete snapshot.
 */
export function validateSnapshot(
  snapshot: AthleteSnapshot | null | undefined,
): SnapshotIntegrity {
  return validateIntegrity(snapshot);
}

export function assertSnapshotImmutable(snapshot: AthleteSnapshot): void {
  if (!Object.isFrozen(snapshot)) {
    throw new Error("AthleteSnapshot must be frozen");
  }
}
