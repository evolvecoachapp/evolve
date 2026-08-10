import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import { createDomainSerializer } from "./createDomainSerializer";

function isWorkspace(value: unknown): value is Workspace {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.athleteId === "string" &&
    typeof candidate.header === "object" &&
    candidate.header !== null &&
    typeof candidate.summary === "object" &&
    candidate.summary !== null &&
    typeof candidate.health === "object" &&
    candidate.health !== null &&
    typeof candidate.goals === "object" &&
    candidate.goals !== null &&
    typeof candidate.workout === "object" &&
    candidate.workout !== null &&
    typeof candidate.nutrition === "object" &&
    candidate.nutrition !== null &&
    typeof candidate.recovery === "object" &&
    candidate.recovery !== null &&
    typeof candidate.insights === "object" &&
    candidate.insights !== null &&
    typeof candidate.timeline === "object" &&
    candidate.timeline !== null &&
    typeof candidate.coach === "object" &&
    candidate.coach !== null &&
    typeof candidate.snapshot === "object" &&
    candidate.snapshot !== null &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null
  );
}

export const WorkspaceSerializer = createDomainSerializer<Workspace>({
  domain: "unified-workspace",
  isValid: isWorkspace,
});
