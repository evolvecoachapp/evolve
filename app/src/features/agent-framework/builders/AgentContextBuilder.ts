import type { AgentCapabilityKey } from "../models/AgentCapabilityKey";
import type { AgentContext } from "../models/AgentContext";
import type { AgentId } from "../models/AgentId";
import type { AgentMetadata } from "../models/AgentMetadata";
import { EMPTY_AGENT_METADATA } from "../models/AgentMetadata";
import type { AgentPriority } from "../models/AgentPriority";
import { AgentPriorities } from "../models/AgentPriority";
import type { AgentRole } from "../models/AgentRole";
import { AgentRoles } from "../models/AgentRole";
import { freezeContext } from "../utils/FreezeAgent";
import { validateContextIntegrity } from "../validators";

export interface AgentContextBuilderInput {
  readonly id?: string;
  readonly agentId: AgentId;
  readonly role?: AgentRole;
  readonly priority?: AgentPriority;
  readonly capabilityKeys?: readonly AgentCapabilityKey[];
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata?: AgentMetadata;
  readonly createdAt?: string;
}

/**
 * Builds an immutable AgentContext.
 */
export class AgentContextBuilder {
  build(input: AgentContextBuilderInput): AgentContext {
    const context = freezeContext({
      id: input.id ?? `ctx:${input.agentId}`,
      agentId: input.agentId,
      role: input.role ?? AgentRoles.GENERIC,
      priority: input.priority ?? AgentPriorities.NORMAL,
      capabilityKeys: Object.freeze([...(input.capabilityKeys ?? [])]),
      attributes: Object.freeze({ ...(input.attributes ?? {}) }),
      metadata: input.metadata ?? EMPTY_AGENT_METADATA,
      createdAt: input.createdAt ?? new Date().toISOString(),
    });

    const issues = validateContextIntegrity(context);
    if (issues.length > 0) {
      throw new Error(`invalid_agent_context:${issues.join(",")}`);
    }

    return context;
  }
}

export function createAgentContextBuilder(): AgentContextBuilder {
  return new AgentContextBuilder();
}

export function buildAgentContext(
  input: AgentContextBuilderInput,
): AgentContext {
  return createAgentContextBuilder().build(input);
}
