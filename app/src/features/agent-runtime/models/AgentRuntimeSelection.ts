import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentId } from "../../agent-framework/models/AgentId";
import type { AgentRole } from "../../agent-framework/models/AgentRole";

/**
 * Immutable deterministic selection outcome.
 */
export interface AgentRuntimeSelection {
  readonly agent: IAgent;
  readonly agentId: AgentId;
  readonly role: AgentRole;
  readonly matchedBy:
    | "agent_id"
    | "role"
    | "capability"
    | "priority"
    | "fallback_role"
    | "fallback_capability";
  readonly capability: AgentCapabilityKey | null;
  readonly fallbackUsed: boolean;
  readonly reason: string;
  readonly candidatesConsidered: number;
}
