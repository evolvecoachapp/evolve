import type { IAgent } from "../../agent-framework/contracts/IAgent";
import { AgentStatuses } from "../../agent-framework/models/AgentStatus";
import { ALL_AGENT_CAPABILITY_KEYS } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";

export function isAgentAvailable(agent: IAgent): boolean {
  const status = agent.getStatus();
  if (
    status === AgentStatuses.SHUTDOWN ||
    status === AgentStatuses.FAILED ||
    status === AgentStatuses.UNREGISTERED ||
    status === AgentStatuses.SHUTTING_DOWN
  ) {
    return false;
  }
  return agent.getConfiguration().enabled !== false;
}

export function capabilityKeysOf(
  agent: IAgent,
): readonly AgentCapabilityKey[] {
  return Object.freeze(
    ALL_AGENT_CAPABILITY_KEYS.filter((key) => agent.supports(key)),
  );
}

export function stableAgentSort(agents: readonly IAgent[]): readonly IAgent[] {
  return Object.freeze(
    [...agents].sort((a, b) => a.id.localeCompare(b.id)),
  );
}
