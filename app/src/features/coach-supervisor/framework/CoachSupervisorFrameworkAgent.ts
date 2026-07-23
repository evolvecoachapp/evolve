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
import type { CoachSupervisor } from "../models/CoachSupervisor";

export const COACH_SUPERVISOR_FRAMEWORK_CAPABILITY_KEYS: readonly AgentCapabilityKey[] =
  Object.freeze([
    AgentCapabilityKeys.GOAL_PLANNING,
    AgentCapabilityKeys.REASONING,
    AgentCapabilityKeys.EXPLANATION,
    AgentCapabilityKeys.ACTION_PLANNING,
    AgentCapabilityKeys.CONVERSATION_ANALYSIS,
    AgentCapabilityKeys.PROGRESS_TRACKING,
    AgentCapabilityKeys.EDUCATION,
    AgentCapabilityKeys.WORKOUT_PLANNING,
    AgentCapabilityKeys.NUTRITION_PLANNING,
    AgentCapabilityKeys.RECOVERY_ANALYSIS,
  ]);

export interface CoachSupervisorFrameworkAgentOptions {
  readonly supervisor: CoachSupervisor;
  readonly clock?: () => string;
  readonly status?: typeof AgentStatuses.READY;
  readonly health?: AgentHealth | null;
}

/**
 * Adapts Coach Supervisor to Agent Framework IAgent.
 * role = coach_supervisor. Reuses framework lifecycle contracts.
 */
export class CoachSupervisorFrameworkAgent implements IAgent {
  readonly id: string;
  private readonly info: Agent;
  private readonly descriptor: AgentDescriptor;
  private readonly capabilities: AgentCapabilities;
  private readonly configuration: AgentConfiguration;
  private readonly metadata: AgentMetadata;
  private readonly health: AgentHealth;

  constructor(options: CoachSupervisorFrameworkAgentOptions) {
    const clock = options.clock ?? (() => new Date().toISOString());
    const supervisor = options.supervisor;
    this.id = supervisor.id;

    this.capabilities = freezeCapabilities(
      createCapabilities(COACH_SUPERVISOR_FRAMEWORK_CAPABILITY_KEYS),
    );
    this.configuration = freezeConfiguration({
      ...createDefaultConfiguration(supervisor.id),
      priority: AgentPriorities.CRITICAL,
      metadata: EMPTY_AGENT_METADATA,
    });
    this.metadata = freezeMetadata({
      tags: Object.freeze([
        ...supervisor.metadata.tags,
        "domain:coach",
        "role:supervisor",
        "framework:agent",
      ]),
      attributes: Object.freeze({
        ...supervisor.metadata.attributes,
        supportedDomains: supervisor.supportedDomains.join(","),
        capabilityCount: String(supervisor.capabilities.length),
      }),
    });
    this.health =
      options.health === undefined
        ? freezeHealth({
            agentId: supervisor.id,
            status: AgentHealthStatuses.HEALTHY,
            checkedAt: clock(),
            message: null,
            details: Object.freeze({ version: supervisor.version }),
          })
        : options.health ?? createUnknownHealth(supervisor.id, clock());

    this.descriptor = buildAgentDescriptor({
      id: supervisor.id,
      name: supervisor.name,
      version: supervisor.version,
      role: AgentRoles.COACH_SUPERVISOR,
      displayName: supervisor.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.CRITICAL,
      capabilities: this.capabilities,
      configuration: this.configuration,
      metadata: this.metadata,
      features: Object.freeze(
        supervisor.capabilities.map((cap) =>
          Object.freeze({
            id: `feature:${cap}`,
            name: cap,
            enabled: true,
            description: `Coach Supervisor capability: ${cap}`,
          }),
        ),
      ),
      registeredAt: supervisor.createdAt,
    });

    this.info = freezeAgent({
      id: supervisor.id,
      name: supervisor.name,
      version: supervisor.version,
      role: AgentRoles.COACH_SUPERVISOR,
      displayName: supervisor.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.CRITICAL,
      capabilities: this.capabilities,
      configuration: this.configuration,
      health: this.health,
      metadata: this.metadata,
      registeredAt: supervisor.createdAt,
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
    return AgentRoles.COACH_SUPERVISOR;
  }

  supports(capability: AgentCapabilityKey): boolean {
    return this.capabilities[capability] === true;
  }
}

export function createCoachSupervisorFrameworkAgent(
  options: CoachSupervisorFrameworkAgentOptions,
): CoachSupervisorFrameworkAgent {
  return new CoachSupervisorFrameworkAgent(options);
}
