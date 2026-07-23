import { buildCollaborationRequest } from "../builders/CollaborationRequestBuilder";
import { CollaborationRoles } from "../models/CollaborationRole";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationParticipantHandler } from "../models/CollaborationParticipantHandler";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import { freezeExecutionResult } from "../utils/FreezeCollaborationState";
import {
  createAgentCollaborationService,
  type AgentCollaborationService,
} from "../services/AgentCollaborationService";

export const FIXED_TIMESTAMP = "2026-07-24T12:00:00.000Z";
export const FIXED_TIMESTAMP_LATER = "2026-07-24T12:00:01.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createFixedNowMs(start = 1_000_000): () => number {
  let current = start;
  return () => {
    const value = current;
    current += 10;
    return value;
  };
}

export function createTestCollaborationService(
  overrides: {
    readonly collaborationId?: string;
    readonly clock?: () => string;
    readonly nowMs?: () => number;
    readonly stopOnError?: boolean;
  } = {},
): AgentCollaborationService {
  return createAgentCollaborationService({
    collaborationId: overrides.collaborationId ?? "collaboration:test",
    clock: overrides.clock ?? createFixedClock(),
    nowMs: overrides.nowMs ?? createFixedNowMs(),
    stopOnError: overrides.stopOnError ?? true,
  });
}

export function createCoachRequest(
  overrides: Partial<CollaborationRequest> & { readonly id?: string } = {},
): CollaborationRequest {
  return buildCollaborationRequest({
    id: overrides.id ?? "req:collab:1",
    coachAgentId: overrides.coachAgentId ?? "agent:coach",
    intent: overrides.intent ?? "coordinate specialists",
    requestedRoles:
      overrides.requestedRoles ??
      Object.freeze([
        CollaborationRoles.WORKOUT,
        CollaborationRoles.NUTRITION,
        CollaborationRoles.RECOVERY,
      ]),
    requestedAgentIds: overrides.requestedAgentIds,
    athleteId: overrides.athleteId ?? "athlete-1",
    conversationId: overrides.conversationId ?? "conv-1",
    sessionId: overrides.sessionId ?? "session-1",
    attributes: overrides.attributes,
    metadata: overrides.metadata,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTrackingHandler(
  label: string,
  callOrder: string[],
): CollaborationParticipantHandler {
  return (input) => {
    callOrder.push(label);
    const completedAt = input.clock();
    return freezeExecutionResult({
      id: `result:${input.task.id}`,
      collaborationId: input.plan.collaborationId,
      planId: input.plan.id,
      batchId: input.task.batchId,
      taskId: input.task.id,
      participantId: input.participant.id,
      agentId: input.participant.agentId,
      order: input.task.order,
      success: true,
      status: CollaborationStatuses.COMPLETED,
      message: `${label} ok`,
      attributes: Object.freeze({
        role: input.participant.role,
        label,
      }),
      error: null,
      metadata: EMPTY_COLLABORATION_METADATA,
      startedAt: input.startedAt,
      completedAt,
      durationMs: 10,
      frozenAt: completedAt,
    });
  };
}

export function createFailingHandler(
  message = "specialist failed",
): CollaborationParticipantHandler {
  return (input) => {
    const completedAt = input.clock();
    return freezeExecutionResult({
      id: `result:${input.task.id}`,
      collaborationId: input.plan.collaborationId,
      planId: input.plan.id,
      batchId: input.task.batchId,
      taskId: input.task.id,
      participantId: input.participant.id,
      agentId: input.participant.agentId,
      order: input.task.order,
      success: false,
      status: CollaborationStatuses.FAILED,
      message,
      attributes: Object.freeze({ role: input.participant.role }),
      error: Object.freeze({
        code: "handler_failed",
        message,
        participantId: input.participant.id,
        taskId: input.task.id,
        occurredAt: completedAt,
      }),
      metadata: EMPTY_COLLABORATION_METADATA,
      startedAt: input.startedAt,
      completedAt,
      durationMs: 5,
      frozenAt: completedAt,
    });
  };
}
