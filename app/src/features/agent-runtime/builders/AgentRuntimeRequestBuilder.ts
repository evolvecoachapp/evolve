import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentId } from "../../agent-framework/models/AgentId";
import type { AgentPriority } from "../../agent-framework/models/AgentPriority";
import type { AgentRole } from "../../agent-framework/models/AgentRole";
import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import { freezeRequest } from "../utils/FreezeRuntime";

/**
 * Fluent builder for immutable AgentRuntimeRequest.
 */
export class AgentRuntimeRequestBuilder {
  private id = "";
  private agentId: AgentId | null = null;
  private role: AgentRole | null = null;
  private capability: AgentCapabilityKey | null = null;
  private fallbackRole: AgentRole | null = null;
  private fallbackCapability: AgentCapabilityKey | null = null;
  private priority: AgentPriority | null = null;
  private intent = "";
  private conversationId: string | null = null;
  private athleteId: string | null = null;
  private attributes: Readonly<
    Record<string, string | number | boolean | null>
  > = Object.freeze({});
  private metadata: AgentRuntimeMetadata = EMPTY_AGENT_RUNTIME_METADATA;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withAgentId(agentId: AgentId | null): this {
    this.agentId = agentId;
    return this;
  }

  withRole(role: AgentRole | null): this {
    this.role = role;
    return this;
  }

  withCapability(capability: AgentCapabilityKey | null): this {
    this.capability = capability;
    return this;
  }

  withFallbackRole(fallbackRole: AgentRole | null): this {
    this.fallbackRole = fallbackRole;
    return this;
  }

  withFallbackCapability(
    fallbackCapability: AgentCapabilityKey | null,
  ): this {
    this.fallbackCapability = fallbackCapability;
    return this;
  }

  withPriority(priority: AgentPriority | null): this {
    this.priority = priority;
    return this;
  }

  withIntent(intent: string): this {
    this.intent = intent;
    return this;
  }

  withConversationId(conversationId: string | null): this {
    this.conversationId = conversationId;
    return this;
  }

  withAthleteId(athleteId: string | null): this {
    this.athleteId = athleteId;
    return this;
  }

  withAttributes(
    attributes: Readonly<Record<string, string | number | boolean | null>>,
  ): this {
    this.attributes = attributes;
    return this;
  }

  withMetadata(metadata: AgentRuntimeMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): AgentRuntimeRequest {
    if (!this.id || !this.createdAt) {
      throw new Error("AgentRuntimeRequestBuilder missing required fields");
    }
    return freezeRequest({
      id: this.id,
      agentId: this.agentId,
      role: this.role,
      capability: this.capability,
      fallbackRole: this.fallbackRole,
      fallbackCapability: this.fallbackCapability,
      priority: this.priority,
      intent: this.intent,
      conversationId: this.conversationId,
      athleteId: this.athleteId,
      attributes: this.attributes,
      metadata: this.metadata,
      createdAt: this.createdAt,
    });
  }
}

export function buildAgentRuntimeRequest(
  partial: Partial<AgentRuntimeRequest> &
    Pick<AgentRuntimeRequest, "id" | "createdAt">,
): AgentRuntimeRequest {
  return new AgentRuntimeRequestBuilder()
    .withId(partial.id)
    .withAgentId(partial.agentId ?? null)
    .withRole(partial.role ?? null)
    .withCapability(partial.capability ?? null)
    .withFallbackRole(partial.fallbackRole ?? null)
    .withFallbackCapability(partial.fallbackCapability ?? null)
    .withPriority(partial.priority ?? null)
    .withIntent(partial.intent ?? "")
    .withConversationId(partial.conversationId ?? null)
    .withAthleteId(partial.athleteId ?? null)
    .withAttributes(partial.attributes ?? Object.freeze({}))
    .withMetadata(partial.metadata ?? EMPTY_AGENT_RUNTIME_METADATA)
    .withCreatedAt(partial.createdAt)
    .build();
}
