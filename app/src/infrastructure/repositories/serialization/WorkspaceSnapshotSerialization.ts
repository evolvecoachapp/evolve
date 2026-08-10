import type { AthleteSnapshot } from "../../../features/athlete-snapshot/models/AthleteSnapshot";
import { createDomainSerializer } from "./createDomainSerializer";

function isAthleteSnapshot(value: unknown): value is AthleteSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.athleteId === "string" &&
    typeof candidate.identity === "object" &&
    candidate.identity !== null &&
    typeof candidate.state === "object" &&
    candidate.state !== null &&
    typeof candidate.workspace === "object" &&
    candidate.workspace !== null &&
    typeof candidate.timeline === "object" &&
    candidate.timeline !== null &&
    typeof candidate.coach === "object" &&
    candidate.coach !== null &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null &&
    typeof candidate.version === "object" &&
    candidate.version !== null &&
    typeof candidate.evidence === "object" &&
    candidate.evidence !== null &&
    typeof candidate.integrity === "object" &&
    candidate.integrity !== null
  );
}

export const WorkspaceSnapshotSerializer =
  createDomainSerializer<AthleteSnapshot>({
    domain: "workspace-snapshot",
    isValid: isAthleteSnapshot,
  });
