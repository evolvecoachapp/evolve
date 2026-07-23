import type { RoutingResolution } from "../contracts/RoutingPort";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function validateRoutingIntegrity(
  routing: RoutingResolution,
): CoachSupervisorValidation {
  const issues = [];
  if (!routing.success) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_ROUTING,
      message: routing.message ?? "Routing failed.",
      path: "routing",
    });
  }
  if (routing.success && routing.targets.length === 0) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_ROUTING,
      message: "Routing succeeded without targets.",
      path: "targets",
    });
  }
  const seen = new Set<number>();
  for (const t of routing.targets) {
    if (seen.has(t.orderIndex)) {
      issues.push({
        code: CoachSupervisorValidationCodes.INCONSISTENT_ORDER,
        message: `Duplicate orderIndex ${t.orderIndex}.`,
        path: "targets.orderIndex",
      });
    }
    seen.add(t.orderIndex);
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
