import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { UnifiedCoachResponse } from "../models/UnifiedCoachResponse";

export function formatPlanDescription(plan: CoachSupervisorPlan): string {
  const agents = plan.coordination.orderedAgentIds.join(", ") || "(none)";
  return `Supervisor plan ${plan.id} coordinates agents: ${agents}`;
}

export function formatResponseMessage(response: UnifiedCoachResponse): string {
  return response.message;
}
