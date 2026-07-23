import type { AgentConfiguration } from "../models/AgentConfiguration";

/**
 * Configuration contract.
 */
export interface IAgentConfiguration {
  getConfiguration(): AgentConfiguration;
}
