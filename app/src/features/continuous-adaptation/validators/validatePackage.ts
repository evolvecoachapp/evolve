import type { AdaptationPackage } from "../models/AdaptationPackage";
import { createAdaptationError, AdaptationErrorCodes } from "../models/AdaptationError";
import type { AdaptationError } from "../models/AdaptationError";
import type { AdaptationValidation } from "../models/AdaptationValidation";
import { validateAdaptationIntegrity } from "./validateAdaptationIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateHistory } from "./validateHistory";
import { validateSnapshot } from "./validateSnapshot";
import { validateTimelineConsistency } from "./validateTimelineConsistency";
import { validateTriggerConsistency } from "./validateTriggerConsistency";

export function validateAdaptationPackage(pkg: AdaptationPackage): AdaptationValidation {
  const issues: AdaptationError[] = [
    ...validateAdaptationIntegrity(pkg.decisions),
    ...validateTriggerConsistency(pkg.decisions),
    ...validateTimelineConsistency(pkg.timeline),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
    ...validateDependencies(pkg.dependencies),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createAdaptationError(AdaptationErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
