import type { AgentExecutionResult } from "../models/AgentExecutionResult";

/**
 * Result contract — immutable agent execution result access.
 */
export interface IAgentResult {
  getResult(): AgentExecutionResult;
}
