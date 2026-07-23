import type { AgentId } from "../models/AgentId";
import type { IAgent } from "./IAgent";

/**
 * Agent registry contract.
 *
 * Register / resolve / list / availability validation only.
 * Does not own concrete domain agent implementations.
 */
export interface IAgentRegistry {
  register(agent: IAgent): void;
  unregister(agentId: AgentId): boolean;
  resolve(agentId: AgentId): IAgent | null;
  list(): readonly IAgent[];
  has(agentId: AgentId): boolean;
  isAvailable(agentId: AgentId): boolean;
  validateAvailability(agentId: AgentId): readonly string[];
  clear(): void;
}
