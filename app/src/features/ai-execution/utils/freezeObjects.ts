import type { AIExecutionCancellation } from "../models/AIExecutionCancellation";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionEvent } from "../models/AIExecutionEvent";
import type { AIExecutionLifecycle } from "../models/AIExecutionLifecycle";
import type { AIExecutionMetadata } from "../models/AIExecutionMetadata";
import type { AIExecutionMetrics } from "../models/AIExecutionMetrics";
import type { AIExecutionPolicy } from "../models/AIExecutionPolicy";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import type { AIExecutionResult } from "../models/AIExecutionResult";
import type { AIExecutionState } from "../models/AIExecutionState";
import type { AIExecutionSummary } from "../models/AIExecutionSummary";
import type { AIExecutionTimeout } from "../models/AIExecutionTimeout";
import type {
  AIExecutionTrace,
  AIExecutionTraceStep,
} from "../models/AIExecutionTrace";
import type { AIExecutionErrorSnapshot } from "../models/AIExecutionError";

export function freezeMetadata(
  metadata: AIExecutionMetadata,
): AIExecutionMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezePolicy(policy: AIExecutionPolicy): AIExecutionPolicy {
  return Object.freeze({
    retry: Object.freeze({ ...policy.retry }),
    timeout: Object.freeze({ ...policy.timeout }),
    cancellation: Object.freeze({ ...policy.cancellation }),
    execution: Object.freeze({ ...policy.execution }),
  });
}

export function freezeCancellation(
  cancellation: AIExecutionCancellation,
): AIExecutionCancellation {
  return Object.freeze({ ...cancellation });
}

export function freezeTimeout(timeout: AIExecutionTimeout): AIExecutionTimeout {
  return Object.freeze({ ...timeout });
}

export function freezeErrorSnapshot(
  error: AIExecutionErrorSnapshot,
): AIExecutionErrorSnapshot {
  return Object.freeze({
    ...error,
    details: Object.freeze({ ...error.details }),
  });
}

export function freezeState(state: AIExecutionState): AIExecutionState {
  return Object.freeze({
    ...state,
    error: state.error ? freezeErrorSnapshot(state.error) : null,
  });
}

export function freezeEvent(event: AIExecutionEvent): AIExecutionEvent {
  return Object.freeze({
    ...event,
    attributes: Object.freeze({ ...event.attributes }),
  });
}

export function freezeLifecycle(
  lifecycle: AIExecutionLifecycle,
): AIExecutionLifecycle {
  return Object.freeze({
    ...lifecycle,
    completedStages: Object.freeze([...lifecycle.completedStages]),
    events: Object.freeze(lifecycle.events.map(freezeEvent)),
  });
}

export function freezeMetrics(metrics: AIExecutionMetrics): AIExecutionMetrics {
  return Object.freeze({
    ...metrics,
    stageDurationsMs: Object.freeze({ ...metrics.stageDurationsMs }),
    tokenUsage: metrics.tokenUsage
      ? Object.freeze({ ...metrics.tokenUsage })
      : null,
  });
}

export function freezeTraceStep(
  step: AIExecutionTraceStep,
): AIExecutionTraceStep {
  return Object.freeze({
    ...step,
    validationIssues: Object.freeze([...step.validationIssues]),
  });
}

export function freezeTrace(trace: AIExecutionTrace): AIExecutionTrace {
  return Object.freeze({
    ...trace,
    steps: Object.freeze(trace.steps.map(freezeTraceStep)),
  });
}

export function freezeSummary(
  summary: AIExecutionSummary,
): AIExecutionSummary {
  return Object.freeze({
    ...summary,
    completedStages: Object.freeze([...summary.completedStages]),
  });
}

export function freezeRequest(
  request: AIExecutionRequest,
): AIExecutionRequest {
  return Object.freeze({
    ...request,
    options: Object.freeze({
      ...request.options,
      stopSequences: Object.freeze([...request.options.stopSequences]),
      attributes: Object.freeze({ ...request.options.attributes }),
    }),
    metadata: freezeMetadata(request.metadata),
    policy: freezePolicy(request.policy),
    cancellation: freezeCancellation(request.cancellation),
    timeout: freezeTimeout(request.timeout),
  });
}

export function freezeContext(
  context: AIExecutionContext,
): AIExecutionContext {
  return Object.freeze({
    ...context,
    options: Object.freeze({
      ...context.options,
      stopSequences: Object.freeze([...context.options.stopSequences]),
      attributes: Object.freeze({ ...context.options.attributes }),
    }),
    state: freezeState(context.state),
    lifecycle: freezeLifecycle(context.lifecycle),
    policy: freezePolicy(context.policy),
    metadata: freezeMetadata(context.metadata),
    validationIssues: Object.freeze([...context.validationIssues]),
  });
}

export function freezeResult(result: AIExecutionResult): AIExecutionResult {
  return Object.freeze({
    ...result,
    error: result.error ? freezeErrorSnapshot(result.error) : null,
    metrics: freezeMetrics(result.metrics),
    trace: freezeTrace(result.trace),
    lifecycle: freezeLifecycle(result.lifecycle),
    summary: freezeSummary(result.summary),
    metadata: freezeMetadata(result.metadata),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
