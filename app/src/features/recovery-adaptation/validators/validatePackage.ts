import type { RecoveryError } from "../models/RecoveryError";
import { createRecoveryError, RecoveryErrorCodes } from "../models/RecoveryError";
import type { RecoveryPackage } from "../models/RecoveryPackage";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { validateAdaptationIntegrity } from "./validateAdaptationIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateHistory } from "./validateHistory";
import { validateProtocolConsistency } from "./validateProtocolConsistency";
import { validateDayConsistency } from "./validateDayConsistency";
import { validatePlanIntegrity } from "./validatePlanIntegrity";
import { validateSnapshot } from "./validateSnapshot";
import { validateWeeklyConsistency } from "./validateWeeklyConsistency";

export function validateRecoveryPackage(pkg: RecoveryPackage): RecoveryValidation {
  const issues: RecoveryError[] = [
    ...validateAdaptationIntegrity(pkg.adaptation),
    ...validatePlanIntegrity(pkg.updatedPlan),
    ...validateDayConsistency(pkg.adaptation),
    ...validateProtocolConsistency(pkg.adaptation),
    ...validateWeeklyConsistency(pkg.adaptation),
    ...validateDependencies(pkg.adaptation),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createRecoveryError(RecoveryErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  if (!pkg.planId) {
    issues.push(
      createRecoveryError(
        RecoveryErrorCodes.MISSING_PLAN,
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
