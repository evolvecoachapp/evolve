import type { AgentExecutionPlan } from "../models/AgentExecutionPlan";
import type { AgentExecutionResult } from "../models/AgentExecutionResult";
import type { AgentRuntimeContext } from "../models/AgentRuntimeContext";
import type { AgentRuntimeDescriptor } from "../models/AgentRuntimeDescriptor";
import type { AgentRuntimeError } from "../models/AgentRuntimeError";
import type { AgentRuntimeEvent } from "../models/AgentRuntimeEvent";
import type { AgentRuntimeMetadata } from "../models/AgentRuntimeMetadata";
import type { AgentRuntimeRequest } from "../models/AgentRuntimeRequest";
import type { AgentRuntimeResponse } from "../models/AgentRuntimeResponse";
import type { AgentRuntimeSelection } from "../models/AgentRuntimeSelection";
import type { AgentRuntimeSnapshot } from "../models/AgentRuntimeSnapshot";
import type { AgentRuntimeState } from "../models/AgentRuntimeState";
import type { AgentRuntimeSummary } from "../models/AgentRuntimeSummary";
import { ALL_AGENT_CAPABILITY_KEYS } from "../../agent-framework/models/AgentCapabilityKey";
import type { AgentCapabilityKey } from "../../agent-framework/models/AgentCapabilityKey";

export function freezeMetadata(
  metadata: AgentRuntimeMetadata,
): AgentRuntimeMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeError(error: AgentRuntimeError): AgentRuntimeError {
  return Object.freeze({
    ...error,
    details: Object.freeze({ ...error.details }),
  });
}

export function freezeRequest(
  request: AgentRuntimeRequest,
): AgentRuntimeRequest {
  return Object.freeze({
    ...request,
    attributes: Object.freeze({ ...request.attributes }),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(
  context: AgentRuntimeContext,
): AgentRuntimeContext {
  return Object.freeze({
    ...context,
    request: freezeRequest(context.request),
    attributes: Object.freeze({ ...context.attributes }),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeState(state: AgentRuntimeState): AgentRuntimeState {
  return Object.freeze({
    ...state,
    metadata: freezeMetadata(state.metadata),
  });
}

export function freezePlan(plan: AgentExecutionPlan): AgentExecutionPlan {
  return Object.freeze({
    ...plan,
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeResult(
  result: AgentExecutionResult,
): AgentExecutionResult {
  return Object.freeze({
    ...result,
    attributes: Object.freeze({ ...result.attributes }),
    error: result.error ? freezeError(result.error) : null,
    metadata: freezeMetadata(result.metadata),
  });
}

export function freezeEvent(event: AgentRuntimeEvent): AgentRuntimeEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeSummary(
  summary: AgentRuntimeSummary,
): AgentRuntimeSummary {
  return Object.freeze({ ...summary });
}

export function freezeSnapshot(
  snapshot: AgentRuntimeSnapshot,
): AgentRuntimeSnapshot {
  return Object.freeze({
    ...snapshot,
    request: freezeRequest(snapshot.request),
    context: freezeContext(snapshot.context),
    state: freezeState(snapshot.state),
    plan: snapshot.plan ? freezePlan(snapshot.plan) : null,
    result: snapshot.result ? freezeResult(snapshot.result) : null,
    events: Object.freeze(snapshot.events.map(freezeEvent)),
    summary: freezeSummary(snapshot.summary),
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeResponse(
  response: AgentRuntimeResponse,
): AgentRuntimeResponse {
  return Object.freeze({
    ...response,
    plan: response.plan ? freezePlan(response.plan) : null,
    result: response.result ? freezeResult(response.result) : null,
    error: response.error ? freezeError(response.error) : null,
    events: Object.freeze(response.events.map(freezeEvent)),
    summary: freezeSummary(response.summary),
    snapshot: freezeSnapshot(response.snapshot),
    metadata: freezeMetadata(response.metadata),
  });
}

export function freezeSelection(
  selection: AgentRuntimeSelection,
): AgentRuntimeSelection {
  return Object.freeze({ ...selection });
}

export function freezeDescriptor(
  descriptor: AgentRuntimeDescriptor,
): AgentRuntimeDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function listSupportedCapabilities(
  supports: (key: AgentCapabilityKey) => boolean,
): readonly AgentCapabilityKey[] {
  return Object.freeze(
    ALL_AGENT_CAPABILITY_KEYS.filter((key) => supports(key)),
  );
}
