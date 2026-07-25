import type { NutritionError } from "../models/NutritionError";
import { createNutritionError, NutritionErrorCodes } from "../models/NutritionError";
import type { NutritionPackage } from "../models/NutritionPackage";
import type { NutritionValidation } from "../models/NutritionValidation";
import { validateAdaptationIntegrity } from "./validateAdaptationIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateHistory } from "./validateHistory";
import { validateMacroConsistency } from "./validateMacroConsistency";
import { validateMealConsistency } from "./validateMealConsistency";
import { validatePlanIntegrity } from "./validatePlanIntegrity";
import { validateSnapshot } from "./validateSnapshot";
import { validateWeeklyConsistency } from "./validateWeeklyConsistency";

export function validateNutritionPackage(pkg: NutritionPackage): NutritionValidation {
  const issues: NutritionError[] = [
    ...validateAdaptationIntegrity(pkg.adaptation),
    ...validatePlanIntegrity(pkg.updatedPlan),
    ...validateMealConsistency(pkg.adaptation),
    ...validateMacroConsistency(pkg.adaptation),
    ...validateWeeklyConsistency(pkg.adaptation),
    ...validateDependencies(pkg.adaptation),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createNutritionError(NutritionErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  if (!pkg.planId) {
    issues.push(
      createNutritionError(
        NutritionErrorCodes.MISSING_PLAN,
        "Package plan id required",
        pkg.id,
      ),
    );
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
