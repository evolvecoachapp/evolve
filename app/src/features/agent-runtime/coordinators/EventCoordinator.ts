import type { AgentRuntimeEvent } from "../models/AgentRuntimeEvent";
import type { AgentRuntimeEventType } from "../models/AgentRuntimeEvent";
import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeStatus } from "../models/AgentRuntimeStatus";
import { freezeEvent } from "../utils/FreezeRuntime";

/**
 * Coordinates immutable runtime event collection. No business logic.
 */
export class EventCoordinator {
  readonly id = "runtime:event-coordinator";
  private readonly events: AgentRuntimeEvent[] = [];
  private seq = 0;

  clear(): void {
    this.events.length = 0;
    this.seq = 0;
  }

  emit(options: {
    readonly type: AgentRuntimeEventType;
    readonly runtimeId: string;
    readonly requestId: string;
    readonly agentId?: string | null;
    readonly status: AgentRuntimeStatus;
    readonly message: string;
    readonly occurredAt: string;
    readonly metadata?: AgentRuntimeMetadata;
  }): AgentRuntimeEvent {
    this.seq += 1;
    const event = freezeEvent({
      id: `event:${options.requestId}:${this.seq}`,
      type: options.type,
      runtimeId: options.runtimeId,
      requestId: options.requestId,
      agentId: options.agentId ?? null,
      status: options.status,
      message: options.message,
      metadata: options.metadata ?? EMPTY_AGENT_RUNTIME_METADATA,
      occurredAt: options.occurredAt,
    });
    this.events.push(event);
    return event;
  }

  list(): readonly AgentRuntimeEvent[] {
    return Object.freeze([...this.events]);
  }
}

export function createEventCoordinator(): EventCoordinator {
  return new EventCoordinator();
}
