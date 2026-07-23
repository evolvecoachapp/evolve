import type { AgentMetadata } from "../models/AgentMetadata";

/**
 * Metadata contract.
 */
export interface IAgentMetadata {
  getMetadata(): AgentMetadata;
}
