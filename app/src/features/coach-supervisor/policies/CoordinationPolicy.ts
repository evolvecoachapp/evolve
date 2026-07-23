import type { CoordinationPlan } from "../models/CoordinationPlan";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function applyCoordinationPolicy(
  plan: CoordinationPlan,
): CoachSupervisorValidation {
  const issues = [];
  if (plan.steps.length === 0) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_PLAN,
      message: "Coordination plan has no steps.",
      path: "steps",
    });
  }
  if (plan.orderedAgentIds.length === 0) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_PLAN,
      message: "Coordination plan has no agents.",
      path: "orderedAgentIds",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
