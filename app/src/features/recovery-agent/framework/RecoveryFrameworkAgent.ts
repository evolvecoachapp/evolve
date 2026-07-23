import type { IAgent } from "../../agent-framework/contracts/IAgent";
import type { Agent } from "../../agent-framework/models/Agent";
import type { AgentCapabilities } from "../../agent-framework/models/AgentCapabilities";
import { createCapabilities } from "../../agent-framework/models/AgentCapabilities";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import { AgentCapabilityKeys } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentConfiguration } from "../../agent-framework/models/AgentConfiguration";
import { createDefaultConfiguration } from "../../agent-framework/models/AgentConfiguration";
import type { AgentDescriptor } from "../../agent-framework/models/AgentDescriptor";
import type { AgentHealth } from "../../agent-framework/models/AgentHealth";
import {
  AgentHealthStatuses,
  createUnknownHealth,
} from "../../agent-framework/models/AgentHealth";
import type { AgentMetadata } from "../../agent-framework/models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../../agent-framework/models/AgentMetadata";
import { AgentPriorities } from "../../agent-framework/models/AgentPriority";
import { AgentRoles } from "../../agent-framework/models/AgentRole";
import { AgentStatuses } from "../../agent-framework/models/AgentStatus";
import { buildAgentDescriptor } from "../../agent-framework/builders/AgentDescriptorBuilder";
import {
  freezeAgent,
  freezeCapabilities,
  freezeConfiguration,
  freezeHealth,
  freezeMetadata,
} from "../../agent-framework/utils/FreezeAgent";
import type { RecoveryAgent } from "../models/RecoveryAgent";

export const RECOVERY_FRAMEWORK_CAPABILITY_KEYS: readonly AgentCapabilityKey[] =
  Object.freeze([
    AgentCapabilityKeys.RECOVERY_ANALYSIS,
    AgentCapabilityKeys.REASONING,
    AgentCapabilityKeys.EXPLANATION,
    AgentCapabilityKeys.ACTION_PLANNING,
    AgentCapabilityKeys.CONVERSATION_ANALYSIS,
    AgentCapabilityKeys.PROGRESS_TRACKING,
    AgentCapabilityKeys.EDUCATION,
  ]);

export interface RecoveryFrameworkAgentOptions {
  readonly recoveryAgent: RecoveryAgent;
  readonly clock?: () => string;
  readonly status?: typeof AgentStatuses.READY;
  readonly health?: AgentHealth | null;
}

/**
 * Adapts an immutable RecoveryAgent descriptor to the Agent Framework IAgent
 * contract. No behavioral changes to recovery processing.
 */
export class RecoveryFrameworkAgent implements IAgent {
  readonly id: string;
  private readonly info: Agent;
  private readonly descriptor: AgentDescriptor;
  private readonly capabilities: AgentCapabilities;
  private readonly configuration: AgentConfiguration;
  private readonly metadata: AgentMetadata;
  private readonly health: AgentHealth;

  constructor(options: RecoveryFrameworkAgentOptions) {
    const clock = options.clock ?? (() => new Date().toISOString());
    const recovery = options.recoveryAgent;
    this.id = recovery.id;

    this.capabilities = freezeCapabilities(
      createCapabilities(RECOVERY_FRAMEWORK_CAPABILITY_KEYS),
    );
    this.configuration = freezeConfiguration({
      ...createDefaultConfiguration(recovery.id),
      priority: AgentPriorities.HIGH,
      metadata: EMPTY_AGENT_METADATA,
    });
    this.metadata = freezeMetadata({
      tags: Object.freeze([
        ...recovery.metadata.tags,
        "domain:recovery",
        "framework:agent",
      ]),
      attributes: Object.freeze({
        ...recovery.metadata.attributes,
        domainCapabilities: recovery.capabilities.join(","),
        strategyCount: recovery.strategyIds.length,
        policyCount: recovery.policyIds.length,
      }),
    });
    this.health =
      options.health === undefined
        ? freezeHealth({
            agentId: recovery.id,
            status: AgentHealthStatuses.HEALTHY,
            checkedAt: clock(),
            message: null,
            details: Object.freeze({ version: recovery.version }),
          })
        : options.health ?? createUnknownHealth(recovery.id, clock());

    this.descriptor = buildAgentDescriptor({
      id: recovery.id,
      name: recovery.name,
      version: recovery.version,
      role: AgentRoles.RECOVERY,
      displayName: recovery.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.HIGH,
      capabilities: this.capabilities,
      configuration: this.configuration,
      metadata: this.metadata,
      features: Object.freeze(
        recovery.capabilities.map((cap) =>
          Object.freeze({
            id: `feature:${cap}`,
            name: cap,
            enabled: true,
            description: `Recovery domain capability: ${cap}`,
          }),
        ),
      ),
      registeredAt: recovery.createdAt,
    });

    this.info = freezeAgent({
      id: recovery.id,
      name: recovery.name,
      version: recovery.version,
      role: AgentRoles.RECOVERY,
      displayName: recovery.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.HIGH,
      capabilities: this.capabilities,
      configuration: this.configuration,
      health: this.health,
      metadata: this.metadata,
      registeredAt: recovery.createdAt,
    });
  }

  getInfo(): Agent {
    return this.info;
  }

  getDescriptor(): AgentDescriptor {
    return this.descriptor;
  }

  getCapabilities(): AgentCapabilities {
    return this.capabilities;
  }

  getConfiguration(): AgentConfiguration {
    return this.configuration;
  }

  getMetadata(): AgentMetadata {
    return this.metadata;
  }

  getStatus() {
    return this.info.status;
  }

  getHealth(): AgentHealth {
    return this.health;
  }

  getRole() {
    return AgentRoles.RECOVERY;
  }

  supports(capability: AgentCapabilityKey): boolean {
    return this.capabilities[capability] === true;
  }
}

export function createRecoveryFrameworkAgent(
  options: RecoveryFrameworkAgentOptions,
): RecoveryFrameworkAgent {
  return new RecoveryFrameworkAgent(options);
}
