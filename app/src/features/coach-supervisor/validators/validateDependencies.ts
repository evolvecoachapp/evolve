import type { CoordinationPlan } from "../models/CoordinationPlan";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function validateDependencies(
  plan: CoordinationPlan,
): CoachSupervisorValidation {
  const ids = new Set(plan.steps.map((s) => s.id));
  const issues = [];
  for (const step of plan.steps) {
    for (const dep of step.dependsOnStepIds) {
      if (!ids.has(dep)) {
        issues.push({
          code: CoachSupervisorValidationCodes.MISSING_DEPENDENCY,
          message: `Missing dependency ${dep} for step ${step.id}.`,
          path: `steps.${step.id}`,
        });
      }
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
