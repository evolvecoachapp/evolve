import { AgentRuntimeResponseBuilder } from "../builders/AgentRuntimeResponseBuilder";
import type { AgentExecutionPlan } from "../models/AgentExecutionPlan";
import type { AgentExecutionResult } from "../models/AgentExecutionResult";
import type { AgentRuntimeContext } from "../models/AgentRuntimeContext";
import type { AgentRuntimeError } from "../models/AgentRuntimeError";
import type { AgentRuntimeEvent } from "../models/AgentRuntimeEvent";
import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import { EMPTY_AGENT_RUNTIME_METADATA } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import type { AgentRuntimeState } from "../models/AgentRuntimeState";
import type { AgentRuntimeStatus } from "../models/AgentRuntimeStatus";
import { AgentRuntimeStatuses } from "../models/AgentRuntimeStatus";
import type { AgentRuntimeSummary } from "../models/AgentRuntimeSummary";
import { freezeSnapshot, freezeSummary } from "../utils/FreezeRuntime";

/**
 * Coordinates immutable response / snapshot / summary assembly.
 */
export class ResponseCoordinator {
  readonly id = "runtime:response-coordinator";

  build(options: {
    readonly runtimeId: string;
    readonly request: AgentRuntimeRequest;
    readonly context: AgentRuntimeContext;
    readonly state: AgentRuntimeState;
    readonly plan: AgentExecutionPlan | null;
    readonly result: AgentExecutionResult | null;
    readonly error: AgentRuntimeError | null;
    readonly events: readonly AgentRuntimeEvent[];
    readonly startedAt: string;
    readonly completedAt: string;
    readonly durationMs: number | null;
    readonly metadata?: AgentRuntimeMetadata;
  }): AgentRuntimeResponse {
    const success = options.result?.success === true && !options.error;
    const status: AgentRuntimeStatus = success
      ? AgentRuntimeStatuses.COMPLETED
      : AgentRuntimeStatuses.FAILED;
    const message = success
      ? options.result?.message ?? "Runtime execution completed"
      : options.error?.message ??
        options.result?.message ??
        "Runtime execution failed";

    const summary: AgentRuntimeSummary = freezeSummary({
      requestId: options.request.id,
      selectedAgentId: options.state.selectedAgentId,
      status,
      success,
      message,
      selectionReason: options.plan?.selectionReason ?? null,
      fallbackUsed: options.plan?.fallbackUsed ?? false,
      eventCount: options.events.length,
      durationMs: options.durationMs,
    });

    const snapshot = freezeSnapshot({
      id: `snapshot:${options.request.id}`,
      runtimeId: options.runtimeId,
      request: options.request,
      context: options.context,
      state: options.state,
      plan: options.plan,
      result: options.result,
      events: options.events,
      summary,
      metadata: options.metadata ?? EMPTY_AGENT_RUNTIME_METADATA,
      capturedAt: options.completedAt,
    });

    return new AgentRuntimeResponseBuilder()
      .withId(`resp:${options.request.id}`)
      .withRequestId(options.request.id)
      .withRuntimeId(options.runtimeId)
      .withSelectedAgentId(options.state.selectedAgentId)
      .withSuccess(success)
      .withStatus(status)
      .withMessage(message)
      .withPlan(options.plan)
      .withResult(options.result)
      .withError(options.error)
      .withEvents(options.events)
      .withSummary(summary)
      .withSnapshot(snapshot)
      .withMetadata(options.metadata ?? EMPTY_AGENT_RUNTIME_METADATA)
      .withStartedAt(options.startedAt)
      .withCompletedAt(options.completedAt)
      .withFrozenAt(options.completedAt)
      .build();
  }
}

export function createResponseCoordinator(): ResponseCoordinator {
  return new ResponseCoordinator();
}
