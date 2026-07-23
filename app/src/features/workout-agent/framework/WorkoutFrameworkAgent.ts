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
import type { WorkoutAgent } from "../models/WorkoutAgent";

/**
 * Framework capability keys enabled for the Workout Agent.
 * Domain-specific capability strings remain on WorkoutAgent.describe().
 */
export const WORKOUT_FRAMEWORK_CAPABILITY_KEYS: readonly AgentCapabilityKey[] =
  Object.freeze([
    AgentCapabilityKeys.WORKOUT_PLANNING,
    AgentCapabilityKeys.REASONING,
    AgentCapabilityKeys.EXPLANATION,
    AgentCapabilityKeys.ACTION_PLANNING,
    AgentCapabilityKeys.CONVERSATION_ANALYSIS,
    AgentCapabilityKeys.PROGRESS_TRACKING,
    AgentCapabilityKeys.EDUCATION,
  ]);

export interface WorkoutFrameworkAgentOptions {
  readonly workoutAgent: WorkoutAgent;
  readonly clock?: () => string;
  readonly status?: typeof AgentStatuses.READY;
  readonly health?: AgentHealth | null;
}

/**
 * Adapts an immutable WorkoutAgent descriptor to the Agent Framework IAgent
 * contract. No behavioral changes to workout processing.
 */
export class WorkoutFrameworkAgent implements IAgent {
  readonly id: string;
  private readonly info: Agent;
  private readonly descriptor: AgentDescriptor;
  private readonly capabilities: AgentCapabilities;
  private readonly configuration: AgentConfiguration;
  private readonly metadata: AgentMetadata;
  private readonly health: AgentHealth;

  constructor(options: WorkoutFrameworkAgentOptions) {
    const clock = options.clock ?? (() => new Date().toISOString());
    const workout = options.workoutAgent;
    this.id = workout.id;

    this.capabilities = freezeCapabilities(
      createCapabilities(WORKOUT_FRAMEWORK_CAPABILITY_KEYS),
    );
    this.configuration = freezeConfiguration({
      ...createDefaultConfiguration(workout.id),
      priority: AgentPriorities.HIGH,
      metadata: EMPTY_AGENT_METADATA,
    });
    this.metadata = freezeMetadata({
      tags: Object.freeze([
        ...workout.metadata.tags,
        "domain:workout",
        "framework:agent",
      ]),
      attributes: Object.freeze({
        ...workout.metadata.attributes,
        domainCapabilities: workout.capabilities.join(","),
        strategyCount: workout.strategyIds.length,
        policyCount: workout.policyIds.length,
      }),
    });
    this.health =
      options.health === undefined
        ? freezeHealth({
            agentId: workout.id,
            status: AgentHealthStatuses.HEALTHY,
            checkedAt: clock(),
            message: null,
            details: Object.freeze({ version: workout.version }),
          })
        : options.health ?? createUnknownHealth(workout.id, clock());

    this.descriptor = buildAgentDescriptor({
      id: workout.id,
      name: workout.name,
      version: workout.version,
      role: AgentRoles.WORKOUT,
      displayName: workout.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.HIGH,
      capabilities: this.capabilities,
      configuration: this.configuration,
      metadata: this.metadata,
      features: Object.freeze(
        workout.capabilities.map((cap) =>
          Object.freeze({
            id: `feature:${cap}`,
            name: cap,
            enabled: true,
            description: `Workout domain capability: ${cap}`,
          }),
        ),
      ),
      registeredAt: workout.createdAt,
    });

    this.info = freezeAgent({
      id: workout.id,
      name: workout.name,
      version: workout.version,
      role: AgentRoles.WORKOUT,
      displayName: workout.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.HIGH,
      capabilities: this.capabilities,
      configuration: this.configuration,
      health: this.health,
      metadata: this.metadata,
      registeredAt: workout.createdAt,
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
    return AgentRoles.WORKOUT;
  }

  supports(capability: AgentCapabilityKey): boolean {
    return this.capabilities[capability] === true;
  }
}

export function createWorkoutFrameworkAgent(
  options: WorkoutFrameworkAgentOptions,
): WorkoutFrameworkAgent {
  return new WorkoutFrameworkAgent(options);
}
