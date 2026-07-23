import type { AgentCapability } from "../models/AgentCapability";
import type { CapabilityCollection } from "../models/CapabilityCollection";
import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityQuery } from "../models/CapabilityQuery";
import { CapabilityQueryKinds } from "../models/CapabilityQuery";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityResult } from "../models/CapabilityResult";
import { CapabilityOperationKinds } from "../models/CapabilityResult";
import { CapabilityEventTypes } from "../models/CapabilityEvent";
import { EMPTY_CAPABILITY_METADATA } from "../models/CapabilityMetadata";
import { buildCapabilityResult } from "../builders/CapabilityResultBuilder";
import type { CapabilityRegistryStore } from "../registry/CapabilityRegistryStore";
import {
  freezeAgentCapability,
  freezeCollection,
  freezeEvent,
  freezeQuery,
} from "../utils/FreezeCapabilityState";
import { sortRegistrationsDeterministic } from "../utils/sortHelpers";

export interface CapabilityQueryEngineDeps {
  readonly store: CapabilityRegistryStore;
  readonly clock?: () => string;
}

/**
 * Deterministic capability querying — never executes agents.
 */
export class CapabilityQueryEngine {
  private readonly store: CapabilityRegistryStore;
  private readonly clock: () => string;
  private sequence = 0;

  constructor(deps: CapabilityQueryEngineDeps) {
    this.store = deps.store;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  findCapability(capabilityId: CapabilityId): CapabilityResult {
    const startedAt = this.clock();
    const registration = this.store.lookup(capabilityId);
    const collection = this.toCollection(
      registration ? [this.toAgentCapability(registration)] : [],
      registration ? [registration] : [],
      startedAt,
    );

    return buildCapabilityResult({
      id: `result:find:${capabilityId}`,
      operation: CapabilityOperationKinds.FIND,
      success: registration !== null,
      message: registration
        ? "Capability found."
        : `Capability not found: ${capabilityId}`,
      registration,
      collection,
      exists: registration !== null,
      ownerAgentId: registration?.agentId ?? null,
      events: [
        freezeEvent({
          id: `event:queried:${++this.sequence}`,
          type: CapabilityEventTypes.QUERIED,
          capabilityId,
          agentId: registration?.agentId ?? null,
          message: "find_capability",
          metadata: EMPTY_CAPABILITY_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }

  findOwner(capabilityId: CapabilityId): CapabilityResult {
    const startedAt = this.clock();
    const registration = this.store.lookup(capabilityId);
    return buildCapabilityResult({
      id: `result:owner:${capabilityId}`,
      operation: CapabilityOperationKinds.FIND,
      success: registration !== null,
      message: registration
        ? "Owner found."
        : `Owner not found for capability: ${capabilityId}`,
      registration,
      exists: registration !== null,
      ownerAgentId: registration?.agentId ?? null,
      startedAt,
      completedAt: startedAt,
    });
  }

  listCapabilities(enabledOnly = false): CapabilityResult {
    const startedAt = this.clock();
    let registrations = this.store.list();
    if (enabledOnly) {
      registrations = Object.freeze(
        registrations.filter((item) => item.enabled),
      );
    }
    registrations = sortRegistrationsDeterministic(registrations);
    const capabilities = registrations.map((item) =>
      this.toAgentCapability(item),
    );
    const collection = this.toCollection(
      capabilities,
      registrations,
      startedAt,
    );

    return buildCapabilityResult({
      id: `result:list:${++this.sequence}`,
      operation: CapabilityOperationKinds.QUERY,
      success: true,
      message: "Capabilities listed.",
      collection,
      exists: registrations.length > 0,
      events: [
        freezeEvent({
          id: `event:queried:${this.sequence}`,
          type: CapabilityEventTypes.QUERIED,
          capabilityId: null,
          agentId: null,
          message: "list_capabilities",
          metadata: EMPTY_CAPABILITY_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }

  listAgentCapabilities(
    agentId: string,
    enabledOnly = false,
  ): CapabilityResult {
    const startedAt = this.clock();
    let registrations = this.store.findByAgent(agentId);
    if (enabledOnly) {
      registrations = Object.freeze(
        registrations.filter((item) => item.enabled),
      );
    }
    const capabilities = registrations.map((item) =>
      this.toAgentCapability(item),
    );
    const collection = this.toCollection(
      capabilities,
      registrations,
      startedAt,
    );

    return buildCapabilityResult({
      id: `result:agent:${agentId}:${++this.sequence}`,
      operation: CapabilityOperationKinds.QUERY,
      success: true,
      message: `Capabilities listed for agent: ${agentId}`,
      collection,
      exists: registrations.length > 0,
      ownerAgentId: agentId,
      startedAt,
      completedAt: startedAt,
    });
  }

  capabilityExists(capabilityId: CapabilityId): CapabilityResult {
    const startedAt = this.clock();
    const exists = this.store.has(capabilityId);
    return buildCapabilityResult({
      id: `result:exists:${capabilityId}`,
      operation: CapabilityOperationKinds.QUERY,
      success: true,
      message: exists
        ? `Capability exists: ${capabilityId}`
        : `Capability does not exist: ${capabilityId}`,
      exists,
      ownerAgentId: this.store.lookup(capabilityId)?.agentId ?? null,
      startedAt,
      completedAt: startedAt,
    });
  }

  execute(query: CapabilityQuery): CapabilityResult {
    const frozen = freezeQuery(query);
    switch (frozen.kind) {
      case CapabilityQueryKinds.FIND_CAPABILITY:
        return this.findCapability(frozen.capabilityId ?? "");
      case CapabilityQueryKinds.FIND_OWNER:
        return this.findOwner(frozen.capabilityId ?? "");
      case CapabilityQueryKinds.LIST_CAPABILITIES:
        return this.listCapabilities(frozen.enabledOnly);
      case CapabilityQueryKinds.LIST_AGENT_CAPABILITIES:
        return this.listAgentCapabilities(
          frozen.agentId ?? "",
          frozen.enabledOnly,
        );
      case CapabilityQueryKinds.CAPABILITY_EXISTS:
        return this.capabilityExists(frozen.capabilityId ?? "");
      default:
        return buildCapabilityResult({
          id: `result:query:unknown`,
          operation: CapabilityOperationKinds.QUERY,
          success: false,
          message: `Unknown query kind: ${String(frozen.kind)}`,
          startedAt: this.clock(),
          completedAt: this.clock(),
        });
    }
  }

  private toAgentCapability(
    registration: CapabilityRegistration,
  ): AgentCapability {
    return freezeAgentCapability({
      capabilityId: registration.capabilityId,
      agentId: registration.agentId,
      descriptor: registration.descriptor,
      enabled: registration.enabled,
      metadata: registration.metadata,
    });
  }

  private toCollection(
    capabilities: readonly AgentCapability[],
    registrations: readonly CapabilityRegistration[],
    createdAt: string,
  ): CapabilityCollection {
    return freezeCollection({
      id: `collection:${++this.sequence}`,
      capabilities: Object.freeze([...capabilities]),
      registrations: Object.freeze([...registrations]),
      count: registrations.length,
      metadata: EMPTY_CAPABILITY_METADATA,
      createdAt,
    });
  }
}

export function createCapabilityQueryEngine(
  deps: CapabilityQueryEngineDeps,
): CapabilityQueryEngine {
  return new CapabilityQueryEngine(deps);
}
