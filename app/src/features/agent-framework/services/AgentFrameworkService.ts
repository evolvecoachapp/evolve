import type { IAgent } from "../contracts/IAgent";
import type { IAgentRegistry } from "../contracts/IAgentRegistry";
import { buildAgentPackage } from "../builders/AgentPackageBuilder";
import { createAgentFactory, AgentFactory } from "../factory/AgentFactory";
import {
  createAgentLifecycle,
  AgentLifecycle,
  createAgentHealthChecker,
  AgentHealthChecker,
} from "../lifecycle";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentId } from "../models/AgentId";
import type { AgentRole } from "../models/AgentRole";
import type { AgentSnapshot } from "../models/AgentSnapshot";
import { createUnknownHealth } from "../models/AgentHealth";
import { EMPTY_AGENT_STATISTICS } from "../models/AgentStatistics";
import {
  createAgentRegistry,
  createCapabilityRegistry,
  createMetadataRegistry,
  createRoleRegistry,
  AgentRegistry,
  CapabilityRegistry,
  MetadataRegistry,
  RoleRegistry,
} from "../registry";
import {
  ALL_CAPABILITY_DEFINITIONS,
  registerDefaultCapabilities,
} from "../capabilities";
import { freezeSnapshot } from "../utils/FreezeAgent";
import {
  createEmptyStatistics,
  incrementRegistration,
  incrementResolve,
} from "../utils/statisticsHelpers";
import type { AgentStatistics } from "../models/AgentStatistics";
import { validateRegistration } from "../validators";
import { AgentStatuses } from "../models/AgentStatus";

export interface AgentFrameworkServiceDeps {
  readonly registry?: AgentRegistry;
  readonly factory?: AgentFactory;
  readonly lifecycle?: AgentLifecycle;
  readonly capabilityRegistry?: CapabilityRegistry;
  readonly roleRegistry?: RoleRegistry;
  readonly metadataRegistry?: MetadataRegistry;
  readonly healthChecker?: AgentHealthChecker;
  readonly clock?: () => string;
  readonly seedDefaultCapabilities?: boolean;
}

/**
 * Service facade over registry / factory / lifecycle.
 * Hides internals from application consumers.
 */
export class AgentFrameworkService {
  private readonly registry: AgentRegistry;
  private readonly factory: AgentFactory;
  private readonly lifecycle: AgentLifecycle;
  private readonly capabilityRegistry: CapabilityRegistry;
  private readonly roleRegistry: RoleRegistry;
  private readonly metadataRegistry: MetadataRegistry;
  private readonly healthChecker: AgentHealthChecker;
  private readonly clock: () => string;
  private readonly statistics = new Map<AgentId, AgentStatistics>();

  constructor(deps: AgentFrameworkServiceDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.registry = deps.registry ?? createAgentRegistry();
    this.factory = deps.factory ?? createAgentFactory(this.registry);
    this.lifecycle = deps.lifecycle ?? createAgentLifecycle(this.clock);
    this.capabilityRegistry =
      deps.capabilityRegistry ?? createCapabilityRegistry();
    this.roleRegistry = deps.roleRegistry ?? createRoleRegistry();
    this.metadataRegistry = deps.metadataRegistry ?? createMetadataRegistry();
    this.healthChecker =
      deps.healthChecker ?? createAgentHealthChecker(this.clock);

    if (deps.seedDefaultCapabilities !== false) {
      for (const capability of ALL_CAPABILITY_DEFINITIONS) {
        if (!this.capabilityRegistry.has(capability.key)) {
          this.capabilityRegistry.register(capability);
        }
      }
    }
  }

  getRegistry(): IAgentRegistry {
    return this.registry;
  }

  getFactory(): AgentFactory {
    return this.factory;
  }

  getLifecycle(): AgentLifecycle {
    return this.lifecycle;
  }

  getCapabilityRegistry(): CapabilityRegistry {
    return this.capabilityRegistry;
  }

  getRoleRegistry(): RoleRegistry {
    return this.roleRegistry;
  }

  getMetadataRegistry(): MetadataRegistry {
    return this.metadataRegistry;
  }

  registerAgent(agent: IAgent): void {
    this.registry.register(agent);
    this.roleRegistry.syncFromAgent(agent);
    this.metadataRegistry.register(
      agent.id,
      agent.getMetadata(),
      this.clock(),
    );
    this.lifecycle.initialize(agent);
    this.statistics.set(
      agent.id,
      incrementRegistration(
        this.statistics.get(agent.id) ?? createEmptyStatistics(),
      ),
    );
  }

  resolveAgent(options: {
    readonly agentId?: AgentId | null;
    readonly role?: AgentRole | null;
    readonly capability?: AgentCapabilityKey | null;
  }): IAgent {
    let agent: IAgent;
    if (options.agentId) {
      agent = this.factory.resolveById(options.agentId);
    } else if (options.role) {
      agent = this.factory.resolveByRole(options.role);
    } else if (options.capability) {
      agent = this.factory.resolveByCapability(options.capability);
    } else {
      agent = this.factory.resolveDefault();
    }

    this.statistics.set(
      agent.id,
      incrementResolve(
        this.statistics.get(agent.id) ?? createEmptyStatistics(),
        this.clock(),
      ),
    );
    return agent;
  }

  listAgents(): readonly IAgent[] {
    return this.registry.list();
  }

  describeAgent(agentId: AgentId): AgentSnapshot | null {
    const agent = this.registry.resolve(agentId);
    if (!agent) {
      return null;
    }

    const descriptor = agent.getDescriptor();
    const state = this.lifecycle.getState(agent.id);
    const health = this.healthChecker.check(agent);
    const stats =
      this.statistics.get(agent.id) ?? EMPTY_AGENT_STATISTICS;

    return freezeSnapshot({
      id: `snapshot:${agent.id}`,
      descriptor,
      state,
      health,
      statistics: stats,
      metadata: agent.getMetadata(),
      capturedAt: this.clock(),
    });
  }

  validateAgent(agentId: AgentId): readonly string[] {
    const agent = this.registry.resolve(agentId);
    if (!agent) {
      return Object.freeze([`agent_not_registered:${agentId}`]);
    }
    return validateRegistration(agent);
  }

  packageAgent(agentId: AgentId) {
    const snapshot = this.describeAgent(agentId);
    if (!snapshot) {
      return null;
    }
    return buildAgentPackage({
      descriptor: snapshot.descriptor,
      statistics: snapshot.statistics,
      metadata: snapshot.metadata,
      packagedAt: this.clock(),
    });
  }

  /** Test helper — expose registered status expectations. */
  isReady(agentId: AgentId): boolean {
    const state = this.lifecycle.getState(agentId);
    return state?.status === AgentStatuses.READY;
  }
}

export function createAgentFrameworkService(
  deps: AgentFrameworkServiceDeps = {},
): AgentFrameworkService {
  return new AgentFrameworkService(deps);
}

export { registerDefaultCapabilities };
