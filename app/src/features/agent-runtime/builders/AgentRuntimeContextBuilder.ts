import type { AgentRuntimeContext } from "../models/AgentRuntimeContext";
import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import { freezeContext } from "../utils/FreezeRuntime";

/**
 * Fluent builder for immutable AgentRuntimeContext.
 */
export class AgentRuntimeContextBuilder {
  private id = "";
  private runtimeId = "";
  private request: AgentRuntimeRequest | null = null;
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

  withRuntimeId(runtimeId: string): this {
    this.runtimeId = runtimeId;
    return this;
  }

  withRequest(request: AgentRuntimeRequest): this {
    this.request = request;
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

  build(): AgentRuntimeContext {
    if (!this.id || !this.runtimeId || !this.request || !this.createdAt) {
      throw new Error("AgentRuntimeContextBuilder missing required fields");
    }
    return freezeContext({
      id: this.id,
      runtimeId: this.runtimeId,
      request: this.request,
      conversationId: this.conversationId ?? this.request.conversationId,
      athleteId: this.athleteId ?? this.request.athleteId,
      attributes: this.attributes,
      metadata: this.metadata,
      createdAt: this.createdAt,
    });
  }
}

export function buildAgentRuntimeContext(options: {
  readonly id: string;
  readonly runtimeId: string;
  readonly request: AgentRuntimeRequest;
  readonly conversationId?: string | null;
  readonly athleteId?: string | null;
  readonly attributes?: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata?: AgentRuntimeMetadata;
  readonly createdAt: string;
}): AgentRuntimeContext {
  return new AgentRuntimeContextBuilder()
    .withId(options.id)
    .withRuntimeId(options.runtimeId)
    .withRequest(options.request)
    .withConversationId(options.conversationId ?? null)
    .withAthleteId(options.athleteId ?? null)
    .withAttributes(options.attributes ?? Object.freeze({}))
    .withMetadata(options.metadata ?? EMPTY_AGENT_RUNTIME_METADATA)
    .withCreatedAt(options.createdAt)
    .build();
}
