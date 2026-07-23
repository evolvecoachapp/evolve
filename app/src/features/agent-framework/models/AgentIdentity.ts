import type { AgentId } from "./AgentId";
import type { AgentRole } from "./AgentRole";

/**
 * Immutable agent identity.
 */
export interface AgentIdentity {
  readonly id: AgentId;
  readonly name: string;
  readonly version: string;
  readonly role: AgentRole;
  readonly displayName: string;
}
