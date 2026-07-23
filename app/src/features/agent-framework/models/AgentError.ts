import type { AgentId } from "./AgentId";

/**
 * Framework error for registry / factory / lifecycle failures.
 */
export class AgentError extends Error {
  readonly code: string;
  readonly agentId: AgentId | null;

  constructor(code: string, message: string, agentId: AgentId | null = null) {
    super(message);
    this.name = "AgentError";
    this.code = code;
    this.agentId = agentId;
  }
}
