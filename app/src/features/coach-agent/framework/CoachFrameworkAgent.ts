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
import type { CoachAgent } from "../models/CoachAgent";

/**
 * Framework capability keys enabled for the Coach meta-agent.
 */
export const COACH_FRAMEWORK_CAPABILITY_KEYS: readonly AgentCapabilityKey[] =
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

export interface CoachFrameworkAgentOptions {
  readonly coachAgent: CoachAgent;
  readonly clock?: () => string;
  readonly status?: typeof AgentStatuses.READY;
  readonly health?: AgentHealth | null;
}

/**
 * Adapts an immutable CoachAgent descriptor to the Agent Framework IAgent
 * contract. No behavioral changes to coaching orchestration.
 */
export class CoachFrameworkAgent implements IAgent {
  readonly id: string;
  private readonly info: Agent;
  private readonly descriptor: AgentDescriptor;
  private readonly capabilities: AgentCapabilities;
  private readonly configuration: AgentConfiguration;
  private readonly metadata: AgentMetadata;
  private readonly health: AgentHealth;

  constructor(options: CoachFrameworkAgentOptions) {
    const clock = options.clock ?? (() => new Date().toISOString());
    const coach = options.coachAgent;
    this.id = coach.id;

    this.capabilities = freezeCapabilities(
      createCapabilities(COACH_FRAMEWORK_CAPABILITY_KEYS),
    );
    this.configuration = freezeConfiguration({
      ...createDefaultConfiguration(coach.id),
      priority: AgentPriorities.CRITICAL,
      metadata: EMPTY_AGENT_METADATA,
    });
    this.metadata = freezeMetadata({
      tags: Object.freeze([
        ...coach.metadata.tags,
        "domain:coach",
        "meta:agent",
        "framework:agent",
      ]),
      attributes: Object.freeze({
        ...coach.metadata.attributes,
        supportedAgents: coach.supportedAgents.join(","),
        futureAgents: coach.futureAgents.join(","),
        capabilityCount: String(coach.capabilities.length),
      }),
    });
    this.health =
      options.health === undefined
        ? freezeHealth({
            agentId: coach.id,
            status: AgentHealthStatuses.HEALTHY,
            checkedAt: clock(),
            message: null,
            details: Object.freeze({ version: coach.version }),
          })
        : options.health ?? createUnknownHealth(coach.id, clock());

    this.descriptor = buildAgentDescriptor({
      id: coach.id,
      name: coach.name,
      version: coach.version,
      role: AgentRoles.COACH_SUPERVISOR,
      displayName: coach.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.CRITICAL,
      capabilities: this.capabilities,
      configuration: this.configuration,
      metadata: this.metadata,
      features: Object.freeze(
        coach.capabilities.map((cap) =>
          Object.freeze({
            id: `feature:${cap}`,
            name: cap,
            enabled: true,
            description: `Coach meta-agent capability: ${cap}`,
          }),
        ),
      ),
      registeredAt: coach.createdAt,
    });

    this.info = freezeAgent({
      id: coach.id,
      name: coach.name,
      version: coach.version,
      role: AgentRoles.COACH_SUPERVISOR,
      displayName: coach.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.CRITICAL,
      capabilities: this.capabilities,
      configuration: this.configuration,
      health: this.health,
      metadata: this.metadata,
      registeredAt: coach.createdAt,
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

export function createCoachFrameworkAgent(
  options: CoachFrameworkAgentOptions,
): CoachFrameworkAgent {
  return new CoachFrameworkAgent(options);
}
