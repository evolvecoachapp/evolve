import type { AggregationContext } from "../models/AggregationContext";
import type { AggregationResult } from "../models/AggregationResult";
import type { CollaborationError } from "../models/CollaborationError";
import type { CollaborationEvent } from "../models/CollaborationEvent";
import type { CollaborationMetadata } from "../models/CollaborationMetadata";
import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationPolicy } from "../models/CollaborationPolicy";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationResult } from "../models/CollaborationResult";
import type { CollaborationSnapshot } from "../models/CollaborationSnapshot";
import type { CollaborationTask } from "../models/CollaborationTask";
import type {
  CollaborationValidation,
  CollaborationValidationIssue,
} from "../models/CollaborationValidation";
import type { ExecutionBatch } from "../models/ExecutionBatch";
import type { ExecutionResult } from "../models/ExecutionResult";

export function freezeMetadata(
  metadata: CollaborationMetadata,
): CollaborationMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeValidationIssue(
  issue: CollaborationValidationIssue,
): CollaborationValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: CollaborationValidation,
): CollaborationValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeError(
  error: CollaborationError | null,
): CollaborationError | null {
  return error ? Object.freeze({ ...error }) : null;
}

export function freezeParticipant(
  participant: CollaborationParticipant,
): CollaborationParticipant {
  return Object.freeze({
    ...participant,
    metadata: freezeMetadata(participant.metadata),
  });
}

export function freezeTask(task: CollaborationTask): CollaborationTask {
  return Object.freeze({
    ...task,
    attributes: Object.freeze({ ...task.attributes }),
    metadata: freezeMetadata(task.metadata),
  });
}

export function freezeBatch(batch: ExecutionBatch): ExecutionBatch {
  return Object.freeze({
    ...batch,
    taskIds: Object.freeze([...batch.taskIds]),
    metadata: freezeMetadata(batch.metadata),
  });
}

export function freezePolicy(
  policy: CollaborationPolicy,
): CollaborationPolicy {
  return Object.freeze({ ...policy });
}

export function freezeRequest(
  request: CollaborationRequest,
): CollaborationRequest {
  return Object.freeze({
    ...request,
    requestedRoles: Object.freeze([...request.requestedRoles]),
    requestedAgentIds: Object.freeze([...request.requestedAgentIds]),
    attributes: Object.freeze({ ...request.attributes }),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezePlan(plan: CollaborationPlan): CollaborationPlan {
  return Object.freeze({
    ...plan,
    participants: Object.freeze(plan.participants.map(freezeParticipant)),
    tasks: Object.freeze(plan.tasks.map(freezeTask)),
    batches: Object.freeze(plan.batches.map(freezeBatch)),
    policies: Object.freeze(plan.policies.map(freezePolicy)),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeExecutionResult(
  result: ExecutionResult,
): ExecutionResult {
  return Object.freeze({
    ...result,
    attributes: Object.freeze({ ...result.attributes }),
    error: freezeError(result.error),
    metadata: freezeMetadata(result.metadata),
  });
}

export function freezeAggregationContext(
  context: AggregationContext,
): AggregationContext {
  return Object.freeze({
    ...context,
    plan: freezePlan(context.plan),
    results: Object.freeze(context.results.map(freezeExecutionResult)),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeAggregationResult(
  result: AggregationResult,
): AggregationResult {
  return Object.freeze({
    ...result,
    results: Object.freeze(result.results.map(freezeExecutionResult)),
    orderedAgentIds: Object.freeze([...result.orderedAgentIds]),
    provenance: Object.freeze([...result.provenance]),
    metadata: freezeMetadata(result.metadata),
  });
}

export function freezeEvent(
  event: CollaborationEvent,
): CollaborationEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeSnapshot(
  snapshot: CollaborationSnapshot,
): CollaborationSnapshot {
  return Object.freeze({
    ...snapshot,
    request: freezeRequest(snapshot.request),
    plan: snapshot.plan ? freezePlan(snapshot.plan) : null,
    results: Object.freeze(snapshot.results.map(freezeExecutionResult)),
    aggregation: snapshot.aggregation
      ? freezeAggregationResult(snapshot.aggregation)
      : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeResult(
  result: CollaborationResult,
): CollaborationResult {
  return Object.freeze({
    ...result,
    plan: result.plan ? freezePlan(result.plan) : null,
    results: Object.freeze(result.results.map(freezeExecutionResult)),
    aggregation: result.aggregation
      ? freezeAggregationResult(result.aggregation)
      : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    validation: freezeValidation(result.validation),
    events: Object.freeze(result.events.map(freezeEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeCollaborationState = Object.freeze({
  freezeMetadata,
  freezeValidation,
  freezeError,
  freezeParticipant,
  freezeTask,
  freezeBatch,
  freezePolicy,
  freezeRequest,
  freezePlan,
  freezeExecutionResult,
  freezeAggregationContext,
  freezeAggregationResult,
  freezeEvent,
  freezeSnapshot,
  freezeResult,
});
