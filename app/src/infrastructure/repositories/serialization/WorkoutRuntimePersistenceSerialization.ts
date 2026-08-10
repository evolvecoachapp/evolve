import type { WorkoutRuntimePersistenceState } from "../../../runtime/domain-persistence/models/WorkoutRuntimePersistenceState";
import { createDomainSerializer } from "./createDomainSerializer";

function isWorkoutRuntime(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.exercises) &&
    typeof candidate.progress === "object" &&
    candidate.progress !== null &&
    typeof candidate.state === "object" &&
    candidate.state !== null
  );
}

function isWorkoutRuntimePersistenceState(
  value: unknown,
): value is WorkoutRuntimePersistenceState {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.athleteId === "string" &&
    (candidate.runtime === null || isWorkoutRuntime(candidate.runtime))
  );
}

export const WorkoutRuntimePersistenceSerializer =
  createDomainSerializer<WorkoutRuntimePersistenceState>({
    domain: "workout-runtime-persistence",
    isValid: isWorkoutRuntimePersistenceState,
  });
