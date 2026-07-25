import type { ContextSnapshot } from "../models/ContextSnapshot";

export function selectSnapshotContextId(
  snapshot: ContextSnapshot,
): string {
  return snapshot.contextId;
}

export function selectSnapshotAthleteId(
  snapshot: ContextSnapshot,
): string {
  return snapshot.athleteId;
}
