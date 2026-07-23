import type { Agent } from "../../agent-framework/models/Agent";
import type { AgentDescriptor } from "../../agent-framework/models/AgentDescriptor";
import type { AgentId } from "../../agent-framework/models/AgentId";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentRuntimeMetadata } from "./AgentRuntimeMetadata";

/**
 * Immutable public description of a registered runtime agent.
 */
export interface AgentRuntimeDescriptor {
  readonly agentId: AgentId;
  readonly role: AgentRole;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly AgentCapabilityKey[];
  readonly hasExecutor: boolean;
  readonly info: Agent;
  readonly descriptor: AgentDescriptor;
  readonly metadata: AgentRuntimeMetadata;
  readonly registeredAt: string;
}
