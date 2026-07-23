import type { UnifiedCoachResponse } from "../models/UnifiedCoachResponse";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function validateResponseConsistency(
  response: UnifiedCoachResponse,
): CoachSupervisorValidation {
  const issues = [];
  if (!response.message.trim()) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_RESPONSE,
      message: "Unified response message is empty.",
      path: "message",
    });
  }
  if (response.agentIds.length === 0) {
    issues.push({
      code: CoachSupervisorValidationCodes.INVALID_RESPONSE,
      message: "Unified response has no agent ids.",
      path: "agentIds",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
