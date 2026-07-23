import type { AgentHealth } from "../models/AgentHealth";

/**
 * Health contract.
 */
export interface IAgentHealth {
  getHealth(): AgentHealth;
}
