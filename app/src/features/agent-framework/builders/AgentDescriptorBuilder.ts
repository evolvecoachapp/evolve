import type { AgentCapabilities } from "../models/AgentCapabilities";
import { createEmptyCapabilities } from "../models/AgentCapabilities";
import type { AgentConfiguration } from "../models/AgentConfiguration";
import { createDefaultConfiguration } from "../models/AgentConfiguration";
import type { AgentDependency } from "../models/AgentDependency";
import type { AgentDescriptor } from "../models/AgentDescriptor";
import type { AgentFeature } from "../models/AgentFeature";
import type { AgentIdentity } from "../models/AgentIdentity";
import type { AgentMetadata } from "../models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import type { AgentPriority } from "../models/AgentPriority";
import { AgentPriorities } from "../models/AgentPriority";
import type { AgentRole } from "../models/AgentRole";
import { AgentRoles } from "../models/AgentRole";
import type { AgentStatus } from "../models/AgentStatus";
import { AgentStatuses } from "../models/AgentStatus";
import { freezeDescriptor } from "../utils/FreezeAgent";

export interface AgentDescriptorBuilderInput {
  readonly id: string;
  readonly name: string;
  readonly version?: string;
  readonly role?: AgentRole;
  readonly displayName?: string;
  readonly status?: AgentStatus;
  readonly priority?: AgentPriority;
  readonly capabilities?: AgentCapabilities;
  readonly configuration?: AgentConfiguration;
  readonly dependencies?: readonly AgentDependency[];
  readonly features?: readonly AgentFeature[];
  readonly metadata?: AgentMetadata;
  readonly registeredAt?: string;
}

/**
 * Builds an immutable AgentDescriptor.
 */
export class AgentDescriptorBuilder {
  build(input: AgentDescriptorBuilderInput): AgentDescriptor {
    const identity: AgentIdentity = Object.freeze({
      id: input.id,
      name: input.name,
      version: input.version ?? "1.0.0",
      role: input.role ?? AgentRoles.GENERIC,
      displayName: input.displayName ?? input.name,
    });

    const configuration =
      input.configuration ?? createDefaultConfiguration(input.id);
    const priority =
      input.priority ?? configuration.priority ?? AgentPriorities.NORMAL;

    return freezeDescriptor({
      identity,
      status: input.status ?? AgentStatuses.REGISTERED,
      priority,
      capabilities: input.capabilities ?? createEmptyCapabilities(),
      configuration,
      dependencies: Object.freeze([...(input.dependencies ?? [])]),
      features: Object.freeze([...(input.features ?? [])]),
      metadata: input.metadata ?? EMPTY_AGENT_METADATA,
      registeredAt: input.registeredAt ?? new Date().toISOString(),
    });
  }
}

export function createAgentDescriptorBuilder(): AgentDescriptorBuilder {
  return new AgentDescriptorBuilder();
}

export function buildAgentDescriptor(
  input: AgentDescriptorBuilderInput,
): AgentDescriptor {
  return createAgentDescriptorBuilder().build(input);
}
