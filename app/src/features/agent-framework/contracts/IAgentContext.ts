import type { AgentContext } from "../models/AgentContext";

/**
 * Context contract — immutable agent context access.
 */
export interface IAgentContext {
  getContext(): AgentContext;
}
