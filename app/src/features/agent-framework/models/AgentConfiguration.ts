import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import { EMPTY_AGENT_METADATA } from "./AgentMetadata";
import type { AgentPriority } from "./AgentPriority";
import { AgentPriorities } from "./AgentPriority";

/**
 * Immutable agent configuration.
 */
export interface AgentConfiguration {
  readonly agentId: AgentId;
  readonly enabled: boolean;
  readonly priority: AgentPriority;
  readonly maxConcurrentSessions: number;
  readonly timeoutMs: number | null;
  readonly metadata: AgentMetadata;
}

export function createDefaultConfiguration(
  agentId: AgentId,
): AgentConfiguration {
  return Object.freeze({
    agentId,
    enabled: true,
    priority: AgentPriorities.NORMAL,
    maxConcurrentSessions: 1,
    timeoutMs: null,
    metadata: EMPTY_AGENT_METADATA,
  });
}
