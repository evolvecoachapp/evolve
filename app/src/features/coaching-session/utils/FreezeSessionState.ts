import type { CoachingSession } from "../models/CoachingSession";
import type { SessionAction } from "../models/SessionAction";
import type { SessionCheckpoint } from "../models/SessionCheckpoint";
import type { SessionConfidence } from "../models/SessionConfidence";
import type { SessionContext } from "../models/SessionContext";
import type { SessionDecision } from "../models/SessionDecision";
import type { SessionDiagnostics } from "../models/SessionDiagnostics";
import type { SessionError } from "../models/SessionError";
import type { SessionEvent } from "../models/SessionEvent";
import type {
  SessionHistory,
  SessionHistoryEntry,
} from "../models/SessionHistory";
import type { SessionLifecycle } from "../models/SessionLifecycle";
import type { SessionMetadata } from "../models/SessionMetadata";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResponse } from "../models/SessionResponse";
import type { SessionResult } from "../models/SessionResult";
import type { SessionSnapshot } from "../models/SessionSnapshot";
import type { SessionState } from "../models/SessionState";
import type { SessionStatistics } from "../models/SessionStatistics";
import type { SessionSummary } from "../models/SessionSummary";
import type {
  SessionTimeline,
  SessionTimelineItem,
} from "../models/SessionTimeline";
import type {
  SessionValidation,
  SessionValidationIssue,
} from "../models/SessionValidation";

export function freezeMetadata(metadata: SessionMetadata): SessionMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeValidationIssue(
  issue: SessionValidationIssue,
): SessionValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: SessionValidation,
): SessionValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeError(error: SessionError | null): SessionError | null {
  return error ? Object.freeze({ ...error }) : null;
}

export function freezeConfidence(
  confidence: SessionConfidence,
): SessionConfidence {
  return Object.freeze({ ...confidence });
}

export function freezeDiagnostics(
  diagnostics: SessionDiagnostics,
): SessionDiagnostics {
  return Object.freeze({
    ...diagnostics,
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    metadata: freezeMetadata(diagnostics.metadata),
  });
}

export function freezeRequest(request: SessionRequest): SessionRequest {
  return Object.freeze({
    ...request,
    requiredCapabilityIds: Object.freeze([...request.requiredCapabilityIds]),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeResponse(response: SessionResponse): SessionResponse {
  return Object.freeze({
    ...response,
    sections: Object.freeze([...response.sections]),
    agentIds: Object.freeze([...response.agentIds]),
    capabilityIds: Object.freeze([...response.capabilityIds]),
    confidence: freezeConfidence(response.confidence),
    diagnostics: freezeDiagnostics(response.diagnostics),
    metadata: freezeMetadata(response.metadata),
  });
}

export function freezeAction(action: SessionAction): SessionAction {
  return Object.freeze({
    ...action,
    metadata: freezeMetadata(action.metadata),
  });
}

export function freezeDecision(decision: SessionDecision): SessionDecision {
  return Object.freeze({
    ...decision,
    confidence: freezeConfidence(decision.confidence),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeEvent(event: SessionEvent): SessionEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeState(state: SessionState): SessionState {
  return Object.freeze({
    ...state,
    metadata: freezeMetadata(state.metadata),
  });
}

export function freezeLifecycle(lifecycle: SessionLifecycle): SessionLifecycle {
  return Object.freeze({
    ...lifecycle,
    metadata: freezeMetadata(lifecycle.metadata),
  });
}

export function freezeHistoryEntry(
  entry: SessionHistoryEntry,
): SessionHistoryEntry {
  return Object.freeze({
    ...entry,
    request: freezeRequest(entry.request),
    response: entry.response ? freezeResponse(entry.response) : null,
  });
}

export function freezeHistory(history: SessionHistory): SessionHistory {
  return Object.freeze({
    ...history,
    entries: Object.freeze(history.entries.map(freezeHistoryEntry)),
    events: Object.freeze(history.events.map(freezeEvent)),
    metadata: freezeMetadata(history.metadata),
  });
}

export function freezeCheckpoint(
  checkpoint: SessionCheckpoint,
): SessionCheckpoint {
  return Object.freeze({
    ...checkpoint,
    metadata: freezeMetadata(checkpoint.metadata),
  });
}

export function freezeContext(context: SessionContext): SessionContext {
  return Object.freeze({
    ...context,
    request: context.request ? freezeRequest(context.request) : null,
    state: freezeState(context.state),
    lifecycle: freezeLifecycle(context.lifecycle),
    history: freezeHistory(context.history),
    checkpoint: context.checkpoint ? freezeCheckpoint(context.checkpoint) : null,
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeTimelineItem(
  item: SessionTimelineItem,
): SessionTimelineItem {
  return Object.freeze({
    ...item,
    event: freezeEvent(item.event),
  });
}

export function freezeTimeline(timeline: SessionTimeline): SessionTimeline {
  return Object.freeze({
    ...timeline,
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeStatistics(
  statistics: SessionStatistics,
): SessionStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeSummary(summary: SessionSummary): SessionSummary {
  return Object.freeze({
    ...summary,
    details: Object.freeze([...summary.details]),
    statistics: freezeStatistics(summary.statistics),
  });
}

export function freezeSnapshot(snapshot: SessionSnapshot): SessionSnapshot {
  return Object.freeze({
    ...snapshot,
    request: snapshot.request ? freezeRequest(snapshot.request) : null,
    context: snapshot.context ? freezeContext(snapshot.context) : null,
    response: snapshot.response ? freezeResponse(snapshot.response) : null,
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    timeline: snapshot.timeline ? freezeTimeline(snapshot.timeline) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeDescriptor(
  descriptor: CoachingSession,
): CoachingSession {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeResult(result: SessionResult): SessionResult {
  return Object.freeze({
    ...result,
    request: result.request ? freezeRequest(result.request) : null,
    context: result.context ? freezeContext(result.context) : null,
    response: result.response ? freezeResponse(result.response) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    descriptor: result.descriptor ? freezeDescriptor(result.descriptor) : null,
    validation: freezeValidation(result.validation),
    error: freezeError(result.error),
    events: Object.freeze(result.events.map(freezeEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeSessionState = Object.freeze({
  freezeMetadata,
  freezeRequest,
  freezeResponse,
  freezeContext,
  freezeHistory,
  freezeCheckpoint,
  freezeTimeline,
  freezeSummary,
  freezeSnapshot,
  freezeResult,
  freezeState,
  freezeLifecycle,
  freezeDescriptor,
});
