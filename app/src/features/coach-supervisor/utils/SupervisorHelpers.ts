import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";

export function describeRequest(request: CoachSupervisorRequest): string {
  return `Supervisor request ${request.id}: ${request.intent}`;
}

export function hasPreferredAgents(request: CoachSupervisorRequest): boolean {
  return request.preferredAgentIds.length > 0;
}
