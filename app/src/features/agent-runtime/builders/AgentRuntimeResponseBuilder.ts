import type { AgentExecutionPlan } from "../models/AgentExecutionPlan";
import type { AgentExecutionResult } from "../models/AgentExecutionResult";
import type { AgentRuntimeError } from "../models/AgentRuntimeError";
import type { AgentRuntimeEvent } from "../models/AgentRuntimeEvent";
import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import type { AgentRuntimeSnapshot } from "../models/AgentRuntimeSnapshot";
import type { AgentRuntimeStatus } from "../models/AgentRuntimeStatus";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import type { AgentRuntimeSummary } from "../models/AgentRuntimeSummary";
import { freezeResponse } from "../utils/FreezeRuntime";

/**
 * Fluent builder for immutable AgentRuntimeResponse.
 */
export class AgentRuntimeResponseBuilder {
  private id = "";
  private requestId = "";
  private runtimeId = "";
  private selectedAgentId: string | null = null;
  private success = false;
  private status: AgentRuntimeStatus = AgentRuntimeStatuses.IDLE;
  private message = "";
  private plan: AgentExecutionPlan | null = null;
  private result: AgentExecutionResult | null = null;
  private error: AgentRuntimeError | null = null;
  private events: readonly AgentRuntimeEvent[] = Object.freeze([]);
  private summary: AgentRuntimeSummary | null = null;
  private snapshot: AgentRuntimeSnapshot | null = null;
  private metadata: AgentRuntimeMetadata = EMPTY_AGENT_RUNTIME_METADATA;
  private startedAt = "";
  private completedAt = "";
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
    return this;
  }

  withRuntimeId(runtimeId: string): this {
    this.runtimeId = runtimeId;
    return this;
  }

  withSelectedAgentId(selectedAgentId: string | null): this {
    this.selectedAgentId = selectedAgentId;
    return this;
  }

  withSuccess(success: boolean): this {
    this.success = success;
    return this;
  }

  withStatus(status: AgentRuntimeStatus): this {
    this.status = status;
    return this;
  }

  withMessage(message: string): this {
    this.message = message;
    return this;
  }

  withPlan(plan: AgentExecutionPlan | null): this {
    this.plan = plan;
    return this;
  }

  withResult(result: AgentExecutionResult | null): this {
    this.result = result;
    return this;
  }

  withError(error: AgentRuntimeError | null): this {
    this.error = error;
    return this;
  }

  withEvents(events: readonly AgentRuntimeEvent[]): this {
    this.events = events;
    return this;
  }

  withSummary(summary: AgentRuntimeSummary): this {
    this.summary = summary;
    return this;
  }

  withSnapshot(snapshot: AgentRuntimeSnapshot): this {
    this.snapshot = snapshot;
    return this;
  }

  withMetadata(metadata: AgentRuntimeMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withStartedAt(startedAt: string): this {
    this.startedAt = startedAt;
    return this;
  }

  withCompletedAt(completedAt: string): this {
    this.completedAt = completedAt;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): AgentRuntimeResponse {
    if (
      !this.id ||
      !this.requestId ||
      !this.runtimeId ||
      !this.summary ||
      !this.snapshot ||
      !this.startedAt ||
      !this.completedAt ||
      !this.frozenAt
    ) {
      throw new Error("AgentRuntimeResponseBuilder missing required fields");
    }
    return freezeResponse({
      id: this.id,
      requestId: this.requestId,
      runtimeId: this.runtimeId,
      selectedAgentId: this.selectedAgentId,
      success: this.success,
      status: this.status,
      message: this.message,
      plan: this.plan,
      result: this.result,
      error: this.error,
      events: this.events,
      summary: this.summary,
      snapshot: this.snapshot,
      metadata: this.metadata,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      frozenAt: this.frozenAt,
    });
  }
}
