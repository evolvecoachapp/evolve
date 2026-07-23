import type { IAgent } from "../contracts/IAgent";
import type { Agent } from "../models/Agent";
import type { AgentCapabilities } from "../models/AgentCapabilities";
import { createCapabilities } from "../models/AgentCapabilities";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import { AgentCapabilityKeys } from "../models/AgentCapabilityKey";
import type { AgentConfiguration } from "../models/AgentConfiguration";
import { createDefaultConfiguration } from "../models/AgentConfiguration";
import type { AgentDescriptor } from "../models/AgentDescriptor";
import type { AgentHealth } from "../models/AgentHealth";
import { createUnknownHealth } from "../models/AgentHealth";
import type { AgentMetadata } from "../models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import type { AgentPriority } from "../models/AgentPriority";
import { AgentPriorities } from "../models/AgentPriority";
import type { AgentRole } from "../models/AgentRole";
import { AgentRoles } from "../models/AgentRole";
import type { AgentStatus } from "../models/AgentStatus";
import { AgentStatuses } from "../models/AgentStatus";
import { buildAgentDescriptor } from "../builders/AgentDescriptorBuilder";
import { freezeAgent, freezeCapabilities, freezeConfiguration, freezeHealth, freezeMetadata } from "../utils/FreezeAgent";
import { createAgentFrameworkService } from "../services/AgentFrameworkService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createTestFrameworkService() {
  return createAgentFrameworkService({
    clock: createFixedClock(),
  });
}

export interface StubAgentOptions {
  readonly id?: string;
  readonly name?: string;
  readonly version?: string;
  readonly role?: AgentRole;
  readonly displayName?: string;
  readonly status?: AgentStatus;
  readonly priority?: AgentPriority;
  readonly capabilities?: AgentCapabilities;
  readonly capabilityKeys?: readonly AgentCapabilityKey[];
  readonly configuration?: AgentConfiguration;
  readonly metadata?: AgentMetadata;
  readonly health?: AgentHealth | null;
  readonly registeredAt?: string;
}

export function createStubAgent(options: StubAgentOptions = {}): IAgent {
  const id = options.id ?? "agent:stub:default";
  const role = options.role ?? AgentRoles.GENERIC;
  const priority = options.priority ?? AgentPriorities.NORMAL;
  const capabilities =
    options.capabilities ??
    createCapabilities(
      options.capabilityKeys ?? [
        AgentCapabilityKeys.REASONING,
        AgentCapabilityKeys.EXPLANATION,
      ],
    );
  const configuration =
    options.configuration ??
    Object.freeze({
      ...createDefaultConfiguration(id),
      priority,
    });
  const metadata = options.metadata ?? EMPTY_AGENT_METADATA;
  const status = options.status ?? AgentStatuses.READY;
  const registeredAt = options.registeredAt ?? FIXED_TIMESTAMP;
  const health =
    options.health === undefined
      ? createUnknownHealth(id, FIXED_TIMESTAMP)
      : options.health;

  const descriptor: AgentDescriptor = buildAgentDescriptor({
    id,
    name: options.name ?? "Stub Agent",
    version: options.version ?? "1.0.0",
    role,
    displayName: options.displayName ?? options.name ?? "Stub Agent",
    status,
    priority,
    capabilities,
    configuration,
    metadata,
    registeredAt,
  });

  const info: Agent = freezeAgent({
    id,
    name: descriptor.identity.name,
    version: descriptor.identity.version,
    role,
    displayName: descriptor.identity.displayName,
    status,
    priority,
    capabilities: freezeCapabilities(capabilities),
    configuration: freezeConfiguration(configuration),
    health: health ? freezeHealth(health) : null,
    metadata: freezeMetadata(metadata),
    registeredAt,
  });

  return {
    id,
    getInfo: () => info,
    getDescriptor: () => descriptor,
    getCapabilities: () => capabilities,
    getConfiguration: () => configuration,
    getMetadata: () => metadata,
    getStatus: () => status,
    getHealth: () =>
      health ?? createUnknownHealth(id, FIXED_TIMESTAMP),
    getRole: () => role,
    supports: (capability: AgentCapabilityKey) => capabilities[capability] === true,
  };
}

export function createWorkoutStubAgent(): IAgent {
  return createStubAgent({
    id: "agent:workout:framework",
    name: "Workout Agent",
    role: AgentRoles.WORKOUT,
    capabilityKeys: [
      AgentCapabilityKeys.WORKOUT_PLANNING,
      AgentCapabilityKeys.REASONING,
      AgentCapabilityKeys.EXPLANATION,
      AgentCapabilityKeys.ACTION_PLANNING,
      AgentCapabilityKeys.CONVERSATION_ANALYSIS,
      AgentCapabilityKeys.PROGRESS_TRACKING,
    ],
    priority: AgentPriorities.HIGH,
  });
}
