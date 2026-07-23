import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";
import { stepAgentIds } from "../utils/CoordinationHelpers";

export function validateExecutionConsistency(input: {
  readonly plan: CoordinationPlan;
  readonly summaries: readonly AgentExecutionSummary[];
}): CoachSupervisorValidation {
  const expected = new Set(stepAgentIds(input.plan));
  const issues = [];
  for (const summary of input.summaries) {
    if (!expected.has(summary.agentId)) {
      issues.push({
        code: CoachSupervisorValidationCodes.INVALID_EXECUTION,
        message: `Unexpected agent ${summary.agentId}.`,
        path: "summaries.agentId",
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
