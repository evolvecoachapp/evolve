import type { StreamCancellation } from "../models/StreamCancellation";
import type { StreamChunk } from "../models/StreamChunk";
import type { StreamCompletion } from "../models/StreamCompletion";
import type { StreamErrorSnapshot } from "../models/StreamError";
import type { StreamEvent } from "../models/StreamEvent";
import type { StreamLifecycle } from "../models/StreamLifecycle";
import type { StreamMetadata } from "../models/StreamMetadata";
import type { StreamMetrics } from "../models/StreamMetrics";
import type { StreamRequest } from "../models/StreamRequest";
import type { StreamResponse } from "../models/StreamResponse";
import type { StreamSnapshot } from "../models/StreamSnapshot";
import type { StreamState } from "../models/StreamState";
import type { StreamSummary } from "../models/StreamSummary";
import type { StreamToken } from "../models/StreamToken";
import type { StreamTrace, StreamTraceStep } from "../models/StreamTrace";

export function freezeMetadata(metadata: StreamMetadata): StreamMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeCancellation(
  cancellation: StreamCancellation,
): StreamCancellation {
  return Object.freeze({ ...cancellation });
}

export function freezeCompletion(
  completion: StreamCompletion,
): StreamCompletion {
  return Object.freeze({ ...completion });
}

export function freezeErrorSnapshot(
  error: StreamErrorSnapshot,
): StreamErrorSnapshot {
  return Object.freeze({
    ...error,
    details: Object.freeze({ ...error.details }),
  });
}

export function freezeChunk(chunk: StreamChunk): StreamChunk {
  return Object.freeze({ ...chunk });
}

export function freezeToken(token: StreamToken): StreamToken {
  return Object.freeze({ ...token });
}

export function freezeEvent(event: StreamEvent): StreamEvent {
  return Object.freeze({
    ...event,
    attributes: Object.freeze({ ...event.attributes }),
  });
}

export function freezeLifecycle(
  lifecycle: StreamLifecycle,
): StreamLifecycle {
  return Object.freeze({
    ...lifecycle,
    events: Object.freeze(lifecycle.events.map(freezeEvent)),
  });
}

export function freezeMetrics(metrics: StreamMetrics): StreamMetrics {
  return Object.freeze({ ...metrics });
}

export function freezeTraceStep(step: StreamTraceStep): StreamTraceStep {
  return Object.freeze({
    ...step,
    validationIssues: Object.freeze([...step.validationIssues]),
  });
}

export function freezeTrace(trace: StreamTrace): StreamTrace {
  return Object.freeze({
    ...trace,
    steps: Object.freeze(trace.steps.map(freezeTraceStep)),
  });
}

export function freezeSummary(summary: StreamSummary): StreamSummary {
  return Object.freeze({ ...summary });
}

export function freezeRequest(request: StreamRequest): StreamRequest {
  return Object.freeze({
    ...request,
    metadata: freezeMetadata(request.metadata),
    cancellation: freezeCancellation(request.cancellation),
  });
}

export function freezeState(state: StreamState): StreamState {
  return Object.freeze({
    ...state,
    chunks: Object.freeze(state.chunks.map(freezeChunk)),
    tokens: Object.freeze(state.tokens.map(freezeToken)),
    lifecycle: freezeLifecycle(state.lifecycle),
    metrics: freezeMetrics(state.metrics),
    completion: freezeCompletion(state.completion),
    cancellation: freezeCancellation(state.cancellation),
    error: state.error ? freezeErrorSnapshot(state.error) : null,
    metadata: freezeMetadata(state.metadata),
    trace: freezeTrace(state.trace),
    validationIssues: Object.freeze([...state.validationIssues]),
  });
}

export function freezeResponse(response: StreamResponse): StreamResponse {
  return Object.freeze({
    ...response,
    completion: freezeCompletion(response.completion),
    error: response.error ? freezeErrorSnapshot(response.error) : null,
    metrics: freezeMetrics(response.metrics),
  });
}

export function freezeSnapshot(snapshot: StreamSnapshot): StreamSnapshot {
  return Object.freeze({
    ...snapshot,
    state: freezeState(snapshot.state),
    response: freezeResponse(snapshot.response),
    summary: freezeSummary(snapshot.summary),
  });
}
