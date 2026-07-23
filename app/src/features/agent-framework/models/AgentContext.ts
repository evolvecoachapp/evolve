import type { AgentCapabilityKey } from "./AgentCapabilityKey";
import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentPriority } from "./AgentPriority";
import type { AgentRole } from "./AgentRole";

/**
 * Immutable framework agent context (no domain payloads).
 */
export interface AgentContext {
  readonly id: string;
  readonly agentId: AgentId;
  readonly role: AgentRole;
  readonly priority: AgentPriority;
  readonly capabilityKeys: readonly AgentCapabilityKey[];
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: AgentMetadata;
  readonly createdAt: string;
}
