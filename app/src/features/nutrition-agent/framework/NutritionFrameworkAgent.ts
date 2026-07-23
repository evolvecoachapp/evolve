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
import type { NutritionAgent } from "../models/NutritionAgent";

/**
 * Framework capability keys enabled for the Nutrition Agent.
 */
export const NUTRITION_FRAMEWORK_CAPABILITY_KEYS: readonly AgentCapabilityKey[] =
  Object.freeze([
    AgentCapabilityKeys.NUTRITION_PLANNING,
    AgentCapabilityKeys.REASONING,
    AgentCapabilityKeys.EXPLANATION,
    AgentCapabilityKeys.ACTION_PLANNING,
    AgentCapabilityKeys.CONVERSATION_ANALYSIS,
    AgentCapabilityKeys.PROGRESS_TRACKING,
    AgentCapabilityKeys.EDUCATION,
  ]);

export interface NutritionFrameworkAgentOptions {
  readonly nutritionAgent: NutritionAgent;
  readonly clock?: () => string;
  readonly status?: typeof AgentStatuses.READY;
  readonly health?: AgentHealth | null;
}

/**
 * Adapts an immutable NutritionAgent descriptor to the Agent Framework IAgent
 * contract. No behavioral changes to nutrition processing.
 */
export class NutritionFrameworkAgent implements IAgent {
  readonly id: string;
  private readonly info: Agent;
  private readonly descriptor: AgentDescriptor;
  private readonly capabilities: AgentCapabilities;
  private readonly configuration: AgentConfiguration;
  private readonly metadata: AgentMetadata;
  private readonly health: AgentHealth;

  constructor(options: NutritionFrameworkAgentOptions) {
    const clock = options.clock ?? (() => new Date().toISOString());
    const nutrition = options.nutritionAgent;
    this.id = nutrition.id;

    this.capabilities = freezeCapabilities(
      createCapabilities(NUTRITION_FRAMEWORK_CAPABILITY_KEYS),
    );
    this.configuration = freezeConfiguration({
      ...createDefaultConfiguration(nutrition.id),
      priority: AgentPriorities.HIGH,
      metadata: EMPTY_AGENT_METADATA,
    });
    this.metadata = freezeMetadata({
      tags: Object.freeze([
        ...nutrition.metadata.tags,
        "domain:nutrition",
        "framework:agent",
      ]),
      attributes: Object.freeze({
        ...nutrition.metadata.attributes,
        domainCapabilities: nutrition.capabilities.join(","),
        strategyCount: nutrition.strategyIds.length,
        policyCount: nutrition.policyIds.length,
      }),
    });
    this.health =
      options.health === undefined
        ? freezeHealth({
            agentId: nutrition.id,
            status: AgentHealthStatuses.HEALTHY,
            checkedAt: clock(),
            message: null,
            details: Object.freeze({ version: nutrition.version }),
          })
        : options.health ?? createUnknownHealth(nutrition.id, clock());

    this.descriptor = buildAgentDescriptor({
      id: nutrition.id,
      name: nutrition.name,
      version: nutrition.version,
      role: AgentRoles.NUTRITION,
      displayName: nutrition.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.HIGH,
      capabilities: this.capabilities,
      configuration: this.configuration,
      metadata: this.metadata,
      features: Object.freeze(
        nutrition.capabilities.map((cap) =>
          Object.freeze({
            id: `feature:${cap}`,
            name: cap,
            enabled: true,
            description: `Nutrition domain capability: ${cap}`,
          }),
        ),
      ),
      registeredAt: nutrition.createdAt,
    });

    this.info = freezeAgent({
      id: nutrition.id,
      name: nutrition.name,
      version: nutrition.version,
      role: AgentRoles.NUTRITION,
      displayName: nutrition.name,
      status: options.status ?? AgentStatuses.READY,
      priority: AgentPriorities.HIGH,
      capabilities: this.capabilities,
      configuration: this.configuration,
      health: this.health,
      metadata: this.metadata,
      registeredAt: nutrition.createdAt,
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
    return AgentRoles.NUTRITION;
  }

  supports(capability: AgentCapabilityKey): boolean {
    return this.capabilities[capability] === true;
  }
}

export function createNutritionFrameworkAgent(
  options: NutritionFrameworkAgentOptions,
): NutritionFrameworkAgent {
  return new NutritionFrameworkAgent(options);
}
