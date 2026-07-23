import type { AgentCapabilityKey } from "./AgentCapabilityKey";
import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentPriority } from "./AgentPriority";
import type { AgentRole } from "./AgentRole";

/**
 * Immutable framework agent request envelope (no domain payloads).
 */
export interface AgentRequest {
  readonly id: string;
  readonly agentId: AgentId | null;
  readonly role: AgentRole | null;
  readonly capabilityKey: AgentCapabilityKey | null;
  readonly priority: AgentPriority;
  readonly intent: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: AgentMetadata;
  readonly createdAt: string;
}
