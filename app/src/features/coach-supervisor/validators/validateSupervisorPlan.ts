import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { validateCoordinationPlan } from "./validateCoordinationPlan";

export function validateSupervisorPlan(
  plan: CoachSupervisorPlan,
): CoachSupervisorValidation {
  const issues = [
    ...validateCoordinationPlan(plan.coordination).issues,
    ...applyConsistencyPolicy(plan).issues,
  ];
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
