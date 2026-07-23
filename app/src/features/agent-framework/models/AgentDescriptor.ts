import type { AgentCapabilities } from "./AgentCapabilities";
import type { AgentConfiguration } from "./AgentConfiguration";
import type { AgentDependency } from "./AgentDependency";
import type { AgentFeature } from "./AgentFeature";
import type { AgentIdentity } from "./AgentIdentity";
import type { AgentMetadata } from "./AgentMetadata";
import type { AgentPriority } from "./AgentPriority";
import type { AgentStatus } from "./AgentStatus";

/**
 * Immutable agent descriptor — registry / factory snapshot.
 * Not an executable agent. Concrete agents implement IAgent.
 */
export interface AgentDescriptor {
  readonly identity: AgentIdentity;
  readonly status: AgentStatus;
  readonly priority: AgentPriority;
  readonly capabilities: AgentCapabilities;
  readonly configuration: AgentConfiguration;
  readonly dependencies: readonly AgentDependency[];
  readonly features: readonly AgentFeature[];
  readonly metadata: AgentMetadata;
  readonly registeredAt: string;
}
