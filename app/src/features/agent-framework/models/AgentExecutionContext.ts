import type { AgentContext } from "./AgentContext";
import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentRequest } from "./AgentRequest";

/**
 * Immutable execution context shell (no execution logic).
 */
export interface AgentExecutionContext {
  readonly id: string;
  readonly agentId: AgentId;
  readonly request: AgentRequest;
  readonly context: AgentContext;
  readonly preparedAt: string;
  readonly metadata: AgentMetadata;
}
