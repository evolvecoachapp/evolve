import type { CapabilityId } from "./CapabilityId";
import type { CapabilityMetadata } from "./CapabilityMetadata";

/**
 * Query kinds for deterministic capability lookup.
 */
export const CapabilityQueryKinds = {
  FIND_CAPABILITY: "find_capability",
  FIND_OWNER: "find_owner",
  LIST_CAPABILITIES: "list_capabilities",
  LIST_AGENT_CAPABILITIES: "list_agent_capabilities",
  CAPABILITY_EXISTS: "capability_exists",
} as const;

export type CapabilityQueryKind =
  (typeof CapabilityQueryKinds)[keyof typeof CapabilityQueryKinds];

/**
 * Immutable capability query (query layer never executes agents).
 */
export interface CapabilityQuery {
  readonly id: string;
  readonly kind: CapabilityQueryKind;
  readonly capabilityId: CapabilityId | null;
  readonly agentId: string | null;
  readonly enabledOnly: boolean;
  readonly metadata: CapabilityMetadata;
  readonly createdAt: string;
}
