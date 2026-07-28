/**
 * Athlete Snapshot composition (Sprint 28.2).
 *
 * Single immutable point-in-time athlete representation.
 * Compose only — no new engines, no persistence, no UI, no LLM.
 */

export * from "./models";
export * from "./services";
export {
  composeAthleteSnapshot,
  getCurrentSnapshot,
  getSnapshotIdentity,
  getSnapshotState,
  getSnapshotWorkspace,
  getSnapshotTimeline,
  getSnapshotCoach,
  validateAthleteSnapshotForAthlete,
} from "./application";
