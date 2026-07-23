import type { CoordinationPlan } from "../models/CoordinationPlan";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";
import { applyCoordinationPolicy } from "../policies/CoordinationPolicy";

export function validateCoordinationPlan(
  plan: CoordinationPlan,
): CoachSupervisorValidation {
  const issues = [...applyCoordinationPolicy(plan).issues];
  const stepIds = new Set<string>();
  for (const step of plan.steps) {
    if (stepIds.has(step.id)) {
      issues.push({
        code: CoachSupervisorValidationCodes.DUPLICATE_STEP,
        message: `Duplicate step ${step.id}.`,
        path: "steps",
      });
    }
    stepIds.add(step.id);
    for (const dep of step.dependsOnStepIds) {
      if (!stepIds.has(dep) && !plan.steps.some((s) => s.id === dep)) {
        issues.push({
          code: CoachSupervisorValidationCodes.MISSING_DEPENDENCY,
          message: `Step ${step.id} depends on missing ${dep}.`,
          path: `steps.${step.id}.dependsOnStepIds`,
        });
      }
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
