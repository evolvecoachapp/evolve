import type { IAgent } from "../../agent-framework/contracts/IAgent";
import { isAgentAvailable } from "../utils/RuntimeHelpers";

export function validateSelectedAgent(
  agent: IAgent | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!agent) {
    return Object.freeze(["selected_agent_missing"]);
  }
  if (!agent.id?.trim()) {
    issues.push("selected_agent_id_missing");
  }
  if (!isAgentAvailable(agent)) {
    issues.push(`selected_agent_unavailable:${agent.id}`);
  }
  try {
    if (!agent.getRole()) {
      issues.push(`selected_agent_role_missing:${agent.id}`);
    }
  } catch {
    issues.push(`selected_agent_role_unavailable:${agent.id}`);
  }
  return Object.freeze(issues);
}
