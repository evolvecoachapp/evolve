import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentCapabilities } from "../models/AgentCapabilities";

/**
 * Capability contract — describe a single immutable capability definition.
 */
export interface IAgentCapability {
  readonly key: AgentCapabilityKey;
  readonly name: string;
  readonly description: string;
  readonly category: string;

  isEnabled(capabilities: AgentCapabilities): boolean;
}
