import type { AgentExecutionPlan } from "../models/AgentExecutionPlan";
import { ALL_AGENT_ROLES } from "../../agent-framework/models/AgentRole";

export function validateExecutionPlan(
  plan: AgentExecutionPlan | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!plan) {
    return Object.freeze(["execution_plan_missing"]);
  }
  if (!plan.id?.trim()) issues.push("execution_plan_id_missing");
  if (!plan.requestId?.trim()) issues.push("execution_plan_request_id_missing");
  if (!plan.agentId?.trim()) issues.push("execution_plan_agent_id_missing");
  if (!plan.selectionReason?.trim()) {
    issues.push("execution_plan_selection_reason_missing");
  }
  if (!ALL_AGENT_ROLES.includes(plan.role)) {
    issues.push(`execution_plan_role_invalid:${plan.role}`);
  }
  if (!plan.createdAt?.trim()) issues.push("execution_plan_created_at_missing");
  if (!plan.frozenAt?.trim()) issues.push("execution_plan_frozen_at_missing");
  return Object.freeze(issues);
}
