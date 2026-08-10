import type { NutritionRuntimePersistenceState } from "../../../runtime/domain-persistence/models/NutritionRuntimePersistenceState";
import { createDomainSerializer } from "./createDomainSerializer";

function isNutritionDayRuntimeState(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.toggledMealIds) &&
    typeof candidate.hydrationMl === "number"
  );
}

function isNutritionRuntimePersistenceState(
  value: unknown,
): value is NutritionRuntimePersistenceState {
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
  return Object.values(candidate.days).every(isNutritionDayRuntimeState);
}

export const NutritionRuntimePersistenceSerializer =
  createDomainSerializer<NutritionRuntimePersistenceState>({
    domain: "nutrition-runtime-persistence",
    isValid: isNutritionRuntimePersistenceState,
  });
