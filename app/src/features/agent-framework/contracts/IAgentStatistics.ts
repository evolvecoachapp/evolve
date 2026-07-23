import type { AgentStatistics } from "../models/AgentStatistics";

/**
 * Statistics contract.
 */
export interface IAgentStatistics {
  getStatistics(): AgentStatistics;
}
