import type { ActionPlan } from "../models/ActionPlan";
import type { ActionValidation } from "../models/ActionValidation";
import { freezeValidation } from "../utils/freezeActionPlan";
import { validateActionIntegrity } from "./validateActionIntegrity";
import { validateArguments } from "./validateArguments";
import { validateConstraints } from "./validateConstraints";
import { validateDependencies } from "./validateDependencies";
import { validatePlanConsistency } from "./validatePlanConsistency";
import { validatePriority } from "./validatePriority";
import { validateTargets } from "./validateTargets";

/**
 * Aggregate ActionPlan validation (integrity only — no execution checks).
 */
export function validateActionPlan(plan: ActionPlan): ActionValidation {
  const issues = Object.freeze([
    ...validateActionIntegrity(plan),
    ...validateDependencies(plan),
    ...validateArguments(plan),
    ...validateTargets(plan),
    ...validatePriority(plan),
    ...validateConstraints(plan),
    ...validatePlanConsistency(plan),
  ]);

  return freezeValidation({
    valid: issues.length === 0,
    issues,
  });
}
