import type { GoalRuntimePersistenceState } from "../../../runtime/domain-persistence/models/GoalRuntimePersistenceState";
import { createDomainSerializer } from "./createDomainSerializer";

function isGoalRuntimePersistenceState(
  value: unknown,
): value is GoalRuntimePersistenceState {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.athleteId === "string" &&
    Array.isArray(candidate.reachedMilestoneIds) &&
    typeof candidate.isCompleted === "boolean"
  );
}

export const GoalRuntimePersistenceSerializer =
  createDomainSerializer<GoalRuntimePersistenceState>({
    domain: "goal-runtime-persistence",
    isValid: isGoalRuntimePersistenceState,
  });
