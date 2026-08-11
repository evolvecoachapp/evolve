import type { Workspace } from "../../../features/unified-workspace/models/Workspace";
import { createDomainSerializer } from "./createDomainSerializer";
import { freezeDeep } from "./freezeDeep";

function isWorkspaceShape(value: unknown): value is Workspace {
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

function withRuntimeOverlays(value: Workspace): Workspace {
  const withGoal =
    value.goalRuntimeOverlay !== undefined
      ? value
      : Object.freeze({ ...value, goalRuntimeOverlay: null });
  const withCoach =
    withGoal.coachRuntimeOverlay !== undefined
      ? withGoal
      : Object.freeze({ ...withGoal, coachRuntimeOverlay: null });
  if (withCoach.notificationRuntimeOverlay !== undefined) {
    return withCoach;
  }
  return Object.freeze({ ...withCoach, notificationRuntimeOverlay: null });
}

const baseSerializer = createDomainSerializer<Workspace>({
  domain: "unified-workspace",
  isValid: isWorkspaceShape,
});

export const WorkspaceSerializer = Object.freeze({
  domain: baseSerializer.domain,
  serialize(value: Workspace): string {
    return baseSerializer.serialize(withRuntimeOverlays(value));
  },
  deserialize(payload: string): Workspace | null {
    const parsed = baseSerializer.deserialize(payload);
    if (!parsed) {
      return null;
    }
    return freezeDeep(withRuntimeOverlays(parsed));
  },
});

export function normalizeLegacyWorkspacePayload(value: unknown): Workspace | null {
  if (!isWorkspaceShape(value)) {
    return null;
  }
  return freezeDeep(withRuntimeOverlays(value as Workspace));
}
