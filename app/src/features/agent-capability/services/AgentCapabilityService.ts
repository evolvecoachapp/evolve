import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityQuery } from "../models/CapabilityQuery";
import type { CapabilityResult } from "../models/CapabilityResult";
import { CapabilityOperationKinds } from "../models/CapabilityResult";
import { CapabilityEventTypes } from "../models/CapabilityEvent";
import { EMPTY_CAPABILITY_METADATA } from "../models/CapabilityMetadata";
import {
  createCapabilityRegistryStore,
  type CapabilityRegistryStore,
  type CapabilityRegistryStoreDeps,
} from "../registry/CapabilityRegistryStore";
import {
  createCapabilityResolver,
  type CapabilityResolver,
} from "../resolver/CapabilityResolver";
import {
  createCapabilityRegistrar,
  type CapabilityRegistrar,
  type CapabilityRegistrationInput,
} from "../registration/CapabilityRegistrar";
import {
  createCapabilityQueryEngine,
  type CapabilityQueryEngine,
} from "../querying/CapabilityQueryEngine";
import { buildCapabilitySnapshotFromInput } from "../builders/CapabilitySnapshotBuilder";
import { buildCapabilityResult } from "../builders/CapabilityResultBuilder";
import { validateRegistryConsistency } from "../validators/validateRegistry";
import { freezeEvent } from "../utils/FreezeCapabilityState";

export interface AgentCapabilityServiceDeps
  extends CapabilityRegistryStoreDeps {
  readonly store?: CapabilityRegistryStore;
  readonly resolver?: CapabilityResolver;
  readonly registrar?: CapabilityRegistrar;
  readonly queryEngine?: CapabilityQueryEngine;
  readonly clock?: () => string;
}

/**
 * Agent Capability Service — deterministic registry facade.
 *
 * No networking. No persistence. No providers. No AI. No prompts.
 * No dependency injection container. No agent execution.
 */
export class AgentCapabilityService {
  private readonly store: CapabilityRegistryStore;
  private readonly resolver: CapabilityResolver;
  private readonly registrar: CapabilityRegistrar;
  private readonly queryEngine: CapabilityQueryEngine;
  private readonly clock: () => string;
  private snapshotSequence = 0;

  constructor(deps: AgentCapabilityServiceDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.store =
      deps.store ??
      createCapabilityRegistryStore({
        registryId: deps.registryId,
        clock: this.clock,
        duplicatePolicy: deps.duplicatePolicy,
      });
    this.resolver =
      deps.resolver ??
      createCapabilityResolver({ store: this.store, clock: this.clock });
    this.registrar =
      deps.registrar ??
      createCapabilityRegistrar({ store: this.store, clock: this.clock });
    this.queryEngine =
      deps.queryEngine ??
      createCapabilityQueryEngine({ store: this.store, clock: this.clock });
  }

  getStore(): CapabilityRegistryStore {
    return this.store;
  }

  getResolver(): CapabilityResolver {
    return this.resolver;
  }

  registerCapability(input: CapabilityRegistrationInput): CapabilityResult {
    return this.registrar.register(input);
  }

  resolveCapability(capabilityId: CapabilityId): CapabilityResult {
    const startedAt = this.clock();
    const resolution = this.resolver.resolve(capabilityId);
    const completedAt = this.clock();
    return buildCapabilityResult({
      id: `result:resolve:${resolution.id}`,
      operation: CapabilityOperationKinds.RESOLVE,
      success: resolution.found,
      message: resolution.found
        ? "Capability resolved."
        : `Capability could not be resolved: ${capabilityId}`,
      resolution,
      registration: resolution.matches[0]?.registration ?? null,
      exists: resolution.found,
      ownerAgentId: resolution.ownerAgentId,
      validation: resolution.validation,
      events: [
        freezeEvent({
          id: `event:resolved:${resolution.id}`,
          type: CapabilityEventTypes.RESOLVED,
          capabilityId,
          agentId: resolution.ownerAgentId,
          message: resolution.found ? "resolved" : "not_found",
          metadata: EMPTY_CAPABILITY_METADATA,
          occurredAt: completedAt,
        }),
      ],
      startedAt,
      completedAt,
    });
  }

  findCapability(capabilityId: CapabilityId): CapabilityResult {
    return this.queryEngine.findCapability(capabilityId);
  }

  findCapabilities(options: {
    readonly agentId?: string;
    readonly enabledOnly?: boolean;
  } = {}): CapabilityResult {
    if (options.agentId) {
      return this.queryEngine.listAgentCapabilities(
        options.agentId,
        options.enabledOnly ?? false,
      );
    }
    return this.queryEngine.listCapabilities(options.enabledOnly ?? false);
  }

  findOwner(capabilityId: CapabilityId): CapabilityResult {
    return this.queryEngine.findOwner(capabilityId);
  }

  capabilityExists(capabilityId: CapabilityId): CapabilityResult {
    return this.queryEngine.capabilityExists(capabilityId);
  }

  query(query: CapabilityQuery): CapabilityResult {
    return this.queryEngine.execute(query);
  }

  buildCapabilitySnapshot(options: {
    readonly snapshotId?: string;
  } = {}): CapabilityResult {
    const startedAt = this.clock();
    this.snapshotSequence += 1;
    const snapshot = buildCapabilitySnapshotFromInput({
      id: options.snapshotId ?? `snapshot:capability:${this.snapshotSequence}`,
      registry: this.store.toRegistry(),
      createdAt: startedAt,
      frozenAt: startedAt,
    });

    return buildCapabilityResult({
      id: `result:snapshot:${snapshot.id}`,
      operation: CapabilityOperationKinds.SNAPSHOT,
      success: true,
      message: "Capability snapshot built.",
      snapshot,
      exists: snapshot.capabilityCount > 0,
      events: [
        freezeEvent({
          id: `event:snapshot:${snapshot.id}`,
          type: CapabilityEventTypes.SNAPSHOT_BUILT,
          capabilityId: null,
          agentId: null,
          message: "snapshot_built",
          metadata: EMPTY_CAPABILITY_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }

  validateRegistry(): CapabilityResult {
    const startedAt = this.clock();
    const validation = validateRegistryConsistency(this.store.list());
    return buildCapabilityResult({
      id: `result:validate:${this.store.getRegistryId()}`,
      operation: CapabilityOperationKinds.VALIDATE,
      success: validation.valid,
      message: validation.valid
        ? "Registry is consistent."
        : "Registry validation failed.",
      validation,
      events: [
        freezeEvent({
          id: `event:validated:${++this.snapshotSequence}`,
          type: CapabilityEventTypes.VALIDATED,
          capabilityId: null,
          agentId: null,
          message: validation.valid ? "valid" : "invalid",
          metadata: EMPTY_CAPABILITY_METADATA,
          occurredAt: startedAt,
        }),
      ],
      startedAt,
      completedAt: startedAt,
    });
  }
}

export function createAgentCapabilityService(
  deps: AgentCapabilityServiceDeps = {},
): AgentCapabilityService {
  return new AgentCapabilityService(deps);
}
