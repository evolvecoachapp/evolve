import type { AgentResponse } from "../models/AgentResponse";

/**
 * Response contract — immutable agent response access.
 */
export interface IAgentResponse {
  getResponse(): AgentResponse;
}
