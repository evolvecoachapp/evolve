import type { RoutingPlan } from "../models/RoutingPlan";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";
import { createConsistencyPolicy } from "../policies/ConsistencyPolicy";

export function validateConsistency(plan: RoutingPlan): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];
  const policy = createConsistencyPolicy();

  if (!policy.isConsistent(plan)) {
    issues.push({
      code: RoutingValidationCodes.INCONSISTENT_PLAN,
      message: "Routing plan internal references are inconsistent.",
      path: "plan",
    });
  }

  if (plan.requestId.trim().length === 0) {
    issues.push({
      code: RoutingValidationCodes.INCONSISTENT_PLAN,
      message: "Plan requestId is required.",
      path: "requestId",
    });
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}
