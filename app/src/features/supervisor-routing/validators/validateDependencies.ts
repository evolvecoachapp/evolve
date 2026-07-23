import type { RoutingDependency } from "../models/RoutingDependency";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";
import { detectCycle } from "../utils/DependencyHelpers";
import { isNonEmptyString } from "../utils/RoutingHelpers";

export function validateDependencies(input: {
  readonly nodeIds: readonly string[];
  readonly dependencies: readonly RoutingDependency[];
}): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];
  const nodeSet = new Set(input.nodeIds);

  for (const dep of input.dependencies) {
    if (!isNonEmptyString(dep.id) || !isNonEmptyString(dep.fromId) || !isNonEmptyString(dep.toId)) {
      issues.push({
        code: RoutingValidationCodes.INVALID_DEPENDENCY,
        message: `Invalid dependency shape: ${dep.id}`,
        path: "dependencies",
      });
      continue;
    }
    if (!nodeSet.has(dep.fromId) || !nodeSet.has(dep.toId)) {
      issues.push({
        code: RoutingValidationCodes.INVALID_DEPENDENCY,
        message: `Dependency references unknown node: ${dep.id}`,
        path: "dependencies",
      });
    }
    if (dep.fromId === dep.toId) {
      issues.push({
        code: RoutingValidationCodes.INVALID_DEPENDENCY,
        message: `Self-dependency not allowed: ${dep.id}`,
        path: "dependencies",
      });
    }
  }

  if (detectCycle(input.nodeIds, input.dependencies)) {
    issues.push({
      code: RoutingValidationCodes.CYCLE_DETECTED,
      message: "Dependency cycle detected.",
      path: "dependencies",
    });
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}
