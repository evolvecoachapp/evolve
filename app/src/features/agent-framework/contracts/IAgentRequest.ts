import type { AgentRequest } from "../models/AgentRequest";

/**
 * Request contract — immutable agent request access.
 */
export interface IAgentRequest {
  getRequest(): AgentRequest;
}
