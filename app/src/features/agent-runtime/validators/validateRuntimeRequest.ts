import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import { ALL_AGENT_ROLES } from "../../agent-framework/models/AgentRole";
import { ALL_AGENT_CAPABILITY_KEYS } from "../../agent-framework/models/AgentCapabilityKey";
import { ALL_AGENT_PRIORITIES } from "../../agent-framework/models/AgentPriority";

export function validateRuntimeRequest(
  request: AgentRuntimeRequest | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!request) {
    return Object.freeze(["request_missing"]);
  }
  if (!request.id?.trim()) {
    issues.push("request_id_missing");
  }
  if (!request.createdAt?.trim()) {
    issues.push("request_created_at_missing");
  }
  if (
    !request.agentId &&
    !request.role &&
    !request.capability &&
    !request.fallbackRole &&
    !request.fallbackCapability &&
    !request.priority
  ) {
    issues.push("request_selection_criteria_missing");
  }
  if (request.role && !ALL_AGENT_ROLES.includes(request.role)) {
    issues.push(`request_role_invalid:${request.role}`);
  }
  if (
    request.fallbackRole &&
    !ALL_AGENT_ROLES.includes(request.fallbackRole)
  ) {
    issues.push(`request_fallback_role_invalid:${request.fallbackRole}`);
  }
  if (
    request.capability &&
    !ALL_AGENT_CAPABILITY_KEYS.includes(request.capability)
  ) {
    issues.push(`request_capability_invalid:${request.capability}`);
  }
  if (
    request.fallbackCapability &&
    !ALL_AGENT_CAPABILITY_KEYS.includes(request.fallbackCapability)
  ) {
    issues.push(
      `request_fallback_capability_invalid:${request.fallbackCapability}`,
    );
  }
  if (
    request.priority &&
    !ALL_AGENT_PRIORITIES.includes(request.priority)
  ) {
    issues.push(`request_priority_invalid:${request.priority}`);
  }
  return Object.freeze(issues);
}
