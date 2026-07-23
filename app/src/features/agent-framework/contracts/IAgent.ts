import type { Agent } from "../models/Agent";
import type { AgentCapabilities } from "../models/AgentCapabilities";
import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentConfiguration } from "../models/AgentConfiguration";
import type { AgentDescriptor } from "../models/AgentDescriptor";
import type { AgentHealth } from "../models/AgentHealth";
import type { AgentId } from "../models/AgentId";
import type { AgentMetadata } from "../models/AgentMetadata";
import type { AgentRole } from "../models/AgentRole";
import type { AgentStatus } from "../models/AgentStatus";

/**
 * Core agent contract.
 *
 * Future Workout / Nutrition / Recovery / Goal / Coach Supervisor agents
 * implement this. Framework ships the interface only — no domain logic,
 * prompts, providers, networking, or persistence.
 */
export interface IAgent {
  readonly id: AgentId;

  getInfo(): Agent;
  getDescriptor(): AgentDescriptor;
  getCapabilities(): AgentCapabilities;
  getConfiguration(): AgentConfiguration;
  getMetadata(): AgentMetadata;
  getStatus(): AgentStatus;
  getHealth(): AgentHealth;
  getRole(): AgentRole;
  supports(capability: AgentCapabilityKey): boolean;
}
