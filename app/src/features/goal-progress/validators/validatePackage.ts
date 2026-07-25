import type { GoalPackage } from "../models/GoalPackage";
import { createGoalError, GoalErrorCodes } from "../models/GoalError";
import type { GoalError } from "../models/GoalError";
import type { GoalValidation } from "../models/GoalValidation";
import { validateGoalIntegrity } from "./validateGoalIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateHistory } from "./validateHistory";
import { validateSnapshot } from "./validateSnapshot";
import { validateTimelineConsistency } from "./validateTimelineConsistency";
import { validateMilestoneConsistency } from "./validateMilestoneConsistency";

export function validateGoalPackage(pkg: GoalPackage): GoalValidation {
  const issues: GoalError[] = [
    ...validateGoalIntegrity(pkg.decisions),
    ...validateMilestoneConsistency(pkg.decisions),
    ...validateTimelineConsistency(pkg.timeline),
    ...validateHistory(pkg.history),
    ...validateSnapshot(pkg.snapshot),
    ...validateDependencies(pkg.dependencies),
  ];
  if (!pkg.athleteId) {
    issues.push(
      createGoalError(GoalErrorCodes.MISSING_ATHLETE, "Package athlete id required", pkg.id),
    );
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
