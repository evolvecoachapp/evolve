import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentId } from "../models/AgentId";
import type { AgentRole } from "../models/AgentRole";
import type { IAgent } from "./IAgent";

/**
 * Factory contract — resolve agents by id, role, capability, or default.
 *
 * No concrete domain agents. Resolves registered contracts only.
 */
export interface IAgentFactory {
  resolveById(agentId: AgentId): IAgent;
  resolveByRole(role: AgentRole): IAgent;
  resolveByCapability(capability: AgentCapabilityKey): IAgent;
  resolveDefault(): IAgent;
  setDefaultAgentId(agentId: AgentId): void;
  getDefaultAgentId(): AgentId | null;
}
