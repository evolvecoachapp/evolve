import type { CoachSupervisorExecution } from "../models/CoachSupervisorExecution";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function applyExecutionPolicy(
  execution: CoachSupervisorExecution,
): CoachSupervisorValidation {
  const issues = [];
  if (!execution.requestId) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_EXECUTION,
      message: "Execution missing requestId.",
      path: "requestId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
