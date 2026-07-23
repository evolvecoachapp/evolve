import type { AgentExecutionContext } from "../models/AgentExecutionContext";

/**
 * Execution context contract — shell only, no execution.
 */
export interface IAgentExecution {
  getExecutionContext(): AgentExecutionContext;
}
