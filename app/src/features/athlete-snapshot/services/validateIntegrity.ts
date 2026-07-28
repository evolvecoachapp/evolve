import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { SnapshotIntegrity } from "../models/SnapshotIntegrity";

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

/**
 * Validates snapshot integrity against required projections and references.
 */
export function validateIntegrity(
  snapshot: AthleteSnapshot | null | undefined,
): SnapshotIntegrity {
  const errors: string[] = [];

  if (!snapshot) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Athlete snapshot is missing"]),
    });
  }

  if (!snapshot.id) errors.push("Snapshot id is required");
  if (!snapshot.athleteId) errors.push("Snapshot athleteId is required");
  if (!snapshot.identity) errors.push("Snapshot identity is required");
  if (!snapshot.state) errors.push("Snapshot state is required");
  if (!snapshot.workspace.present || !snapshot.workspace.workspace) {
    errors.push("Snapshot workspace projection is required");
  }
  if (!snapshot.timeline.present || !snapshot.timeline.timeline) {
    errors.push("Snapshot timeline projection is required");
  }
  if (!snapshot.coach.present || !snapshot.coach.session) {
    errors.push("Snapshot coach projection is required");
  }
  if (!snapshot.metadata) errors.push("Snapshot metadata is required");
  if (!snapshot.version) errors.push("Snapshot version is required");
  if (!snapshot.evidence) errors.push("Snapshot evidence is required");

  if (snapshot.identity?.athleteId !== snapshot.athleteId) {
    errors.push("Identity athleteId must match snapshot athleteId");
  }
  if (snapshot.state?.athleteId !== snapshot.athleteId) {
    errors.push("State athleteId must match snapshot athleteId");
  }
  if (snapshot.workspace?.athleteId !== snapshot.athleteId) {
    errors.push("Workspace athleteId must match snapshot athleteId");
  }
  if (snapshot.timeline?.athleteId !== snapshot.athleteId) {
    errors.push("Timeline athleteId must match snapshot athleteId");
  }
  if (snapshot.coach?.athleteId !== snapshot.athleteId) {
    errors.push("Coach athleteId must match snapshot athleteId");
  }
  if (snapshot.evidence?.athleteId !== snapshot.athleteId) {
    errors.push("Evidence athleteId must match snapshot athleteId");
  }
  if (snapshot.identity?.snapshotId !== snapshot.id) {
    errors.push("Identity snapshotId must match snapshot id");
  }

  if (
    snapshot.workspace.workspaceId !==
    (snapshot.workspace.workspace?.id ?? null)
  ) {
    errors.push("Workspace projection must reference the current workspace id");
  }
  const timelineEntryIds = new Set(
    (snapshot.timeline.timeline?.entries ?? []).map((entry) => entry.id),
  );
  for (const entryId of snapshot.evidence.timelineEntryIds) {
    if (!timelineEntryIds.has(entryId)) {
      errors.push(`Evidence timeline reference is missing: ${entryId}`);
    }
  }
  if (
    snapshot.coach.evidence &&
    snapshot.evidence.coachingSessionId !== snapshot.coach.sessionId
  ) {
    errors.push("Evidence coachingSessionId must match coach sessionId");
  }
  if (
    snapshot.version.workspaceVersion === "unavailable" ||
    snapshot.version.timelineVersion === "unavailable" ||
    snapshot.version.coachVersion === "unavailable"
  ) {
    errors.push("Snapshot version compatibility requires all upstream versions");
  }

  if (!isFrozen(snapshot.identity)) errors.push("identity must be immutable");
  if (!isFrozen(snapshot.state)) errors.push("state must be immutable");
  if (!isFrozen(snapshot.workspace)) errors.push("workspace must be immutable");
  if (!isFrozen(snapshot.timeline)) errors.push("timeline must be immutable");
  if (!isFrozen(snapshot.coach)) errors.push("coach must be immutable");
  if (!isFrozen(snapshot.metadata)) errors.push("metadata must be immutable");
  if (!isFrozen(snapshot.version)) errors.push("version must be immutable");
  if (!isFrozen(snapshot.evidence)) errors.push("evidence must be immutable");
  if (!isFrozen(snapshot)) errors.push("Snapshot must be immutable (Object.freeze)");

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}
