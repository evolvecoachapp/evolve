import type { RoutingPlan } from "../models/RoutingPlan";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";

export function validateUniqueness(plan: RoutingPlan): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];
  const targetIds = new Set<string>();
  const capabilityIds = new Set<string>();

  for (const target of plan.targets) {
    if (targetIds.has(target.id)) {
      issues.push({
        code: RoutingValidationCodes.DUPLICATE_TARGET,
        message: `Duplicate target id: ${target.id}`,
        path: "targets",
      });
    }
    targetIds.add(target.id);

    const key = `${target.agentId}::${target.capabilityId}`;
    if (capabilityIds.has(key)) {
      issues.push({
        code: RoutingValidationCodes.DUPLICATE_TARGET,
        message: `Duplicate agent/capability target: ${key}`,
        path: "targets",
      });
    }
    capabilityIds.add(key);
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}
