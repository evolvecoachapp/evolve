import type { AgentCapabilityKey } from "./AgentCapabilityKey";
import type { AgentId } from "./AgentId";

/**
 * Immutable dependency declaration (agent id or capability).
 */
export interface AgentDependency {
  readonly id: string;
  readonly kind: "agent" | "capability";
  readonly targetId: AgentId | AgentCapabilityKey;
  readonly required: boolean;
  readonly description: string;
}
