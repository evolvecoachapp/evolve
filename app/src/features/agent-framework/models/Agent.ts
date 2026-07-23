import type { AgentCapabilities } from "./AgentCapabilities";
import type { AgentConfiguration } from "./AgentConfiguration";
import type { AgentHealth } from "./AgentHealth";
import type { AgentId } from "./AgentId";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentPriority } from "./AgentPriority";
import type { AgentRole } from "./AgentRole";
import type { AgentStatus } from "./AgentStatus";

/**
 * Immutable agent descriptor model (framework view).
 * Concrete agents implement IAgent and expose this via getDescriptor / describe.
 */
export interface Agent {
  readonly id: AgentId;
  readonly name: string;
  readonly version: string;
  readonly role: AgentRole;
  readonly displayName: string;
  readonly status: AgentStatus;
  readonly priority: AgentPriority;
  readonly capabilities: AgentCapabilities;
  readonly configuration: AgentConfiguration;
  readonly health: AgentHealth | null;
  readonly metadata: AgentMetadata;
  readonly registeredAt: string;
}
