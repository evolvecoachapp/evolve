import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import {
  CoachSupervisorValidationCodes,
  type CoachSupervisorValidation,
} from "../models/CoachSupervisorValidation";

export function applyConsistencyPolicy(
  plan: CoachSupervisorPlan,
): CoachSupervisorValidation {
  const issues = [];
  if (plan.requestId !== plan.coordination.requestId) {
    issues.push({
      code: CoachSupervisorValidationCodes.INCONSISTENT_ORDER,
      message: "Plan requestId does not match coordination requestId.",
      path: "requestId",
    });
  }
  const decisionAgents = new Set(plan.decision.selectedAgentIds);
  for (const agentId of plan.coordination.orderedAgentIds) {
    if (!decisionAgents.has(agentId)) {
      issues.push({
        code: CoachSupervisorValidationCodes.INCONSISTENT_ORDER,
        message: `Agent ${agentId} missing from decision.`,
        path: "decision.selectedAgentIds",
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
