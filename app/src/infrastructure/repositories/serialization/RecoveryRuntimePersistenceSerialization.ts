import type { RecoveryRuntimePersistenceState } from "../../../runtime/domain-persistence/models/RecoveryRuntimePersistenceState";
import { createDomainSerializer } from "./createDomainSerializer";

function isRecoveryDayRuntimeState(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.sleepHours === "number" &&
    typeof candidate.sleepQuality === "number" &&
    typeof candidate.sleepLogged === "boolean" &&
    typeof candidate.readinessScore === "number" &&
    typeof candidate.assessedScore === "number"
  );
}

function isRecoveryRuntimePersistenceState(
  value: unknown,
): value is RecoveryRuntimePersistenceState {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.athleteId !== "string" || typeof candidate.days !== "object") {
    return false;
  }
  if (candidate.days === null) {
    return false;
  }
  return Object.values(candidate.days).every(isRecoveryDayRuntimeState);
}

export const RecoveryRuntimePersistenceSerializer =
  createDomainSerializer<RecoveryRuntimePersistenceState>({
    domain: "recovery-runtime-persistence",
    isValid: isRecoveryRuntimePersistenceState,
  });
