import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationParticipantHandler } from "../models/CollaborationParticipantHandler";
import type { CollaborationPlan } from "../models/CollaborationPlan";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationTask } from "../models/CollaborationTask";
import { createCollaborationError } from "../models/CollaborationError";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import type { ExecutionResult } from "../models/ExecutionResult";
import { freezeExecutionResult } from "../utils/FreezeCollaborationState";
import { sortBatchesDeterministic, sortTasksDeterministic } from "../utils/sortHelpers";

export interface CollaborationDispatcherDeps {
  readonly handlers?: ReadonlyMap<string, CollaborationParticipantHandler>;
  readonly defaultHandler?: CollaborationParticipantHandler;
}

/**
 * Deterministic dispatch — invoke planned participants in order.
 *
 * No retries. No queues. No concurrency abstractions. No networking.
 */
export class CollaborationDispatcher {
  private readonly handlers: ReadonlyMap<string, CollaborationParticipantHandler>;
  private readonly defaultHandler: CollaborationParticipantHandler;

  constructor(deps: CollaborationDispatcherDeps = {}) {
    this.handlers = deps.handlers ?? new Map();
    this.defaultHandler = deps.defaultHandler ?? defaultShellHandler;
  }

  async dispatch(input: {
    readonly request: CollaborationRequest;
    readonly plan: CollaborationPlan;
    readonly collaborationId: string;
    readonly clock: () => string;
    readonly nowMs: () => number;
    readonly stopOnError?: boolean;
  }): Promise<readonly ExecutionResult[]> {
    const stopOnError = input.stopOnError ?? true;
    const participantsById = new Map(
      input.plan.participants.map((p) => [p.id, p] as const),
    );
    const tasksById = new Map(input.plan.tasks.map((t) => [t.id, t] as const));
    const results: ExecutionResult[] = [];

    for (const batch of sortBatchesDeterministic(input.plan.batches)) {
      const batchTasks = sortTasksDeterministic(
        batch.taskIds
          .map((id) => tasksById.get(id))
          .filter((t): t is CollaborationTask => t != null),
      );

      for (const task of batchTasks) {
        const participant = participantsById.get(task.participantId);
        if (!participant) {
          const completedAt = input.clock();
          results.push(
            freezeExecutionResult({
              id: `result:${task.id}:missing-participant`,
              collaborationId: input.collaborationId,
              planId: input.plan.id,
              batchId: batch.id,
              taskId: task.id,
              participantId: task.participantId,
              agentId: task.agentId,
              order: task.order,
              success: false,
              status: CollaborationStatuses.FAILED,
              message: `Missing participant for task ${task.id}.`,
              attributes: Object.freeze({}),
              error: createCollaborationError({
                code: "missing_participant",
                message: `Missing participant for task ${task.id}.`,
                participantId: task.participantId,
                taskId: task.id,
                occurredAt: completedAt,
              }),
              metadata: EMPTY_COLLABORATION_METADATA,
              startedAt: completedAt,
              completedAt,
              durationMs: 0,
              frozenAt: completedAt,
            }),
          );
          if (stopOnError) return Object.freeze(results);
          continue;
        }

        const result = await this.invokeParticipant({
          request: input.request,
          plan: input.plan,
          participant,
          task,
          collaborationId: input.collaborationId,
          clock: input.clock,
          nowMs: input.nowMs,
        });
        results.push(result);

        if (!result.success && stopOnError) {
          return Object.freeze(results);
        }
      }
    }

    return Object.freeze(results);
  }

  private async invokeParticipant(input: {
    readonly request: CollaborationRequest;
    readonly plan: CollaborationPlan;
    readonly participant: CollaborationParticipant;
    readonly task: CollaborationTask;
    readonly collaborationId: string;
    readonly clock: () => string;
    readonly nowMs: () => number;
  }): Promise<ExecutionResult> {
    const startedAt = input.clock();
    const startMs = input.nowMs();
    const handler =
      this.handlers.get(input.participant.agentId) ?? this.defaultHandler;

    try {
      const result = await handler({
        request: input.request,
        plan: input.plan,
        participant: input.participant,
        task: input.task,
        startedAt,
        clock: input.clock,
        nowMs: input.nowMs,
      });
      return freezeExecutionResult(result);
    } catch (error) {
      const completedAt = input.clock();
      const message =
        error instanceof Error ? error.message : "Participant dispatch failed";
      return freezeExecutionResult({
        id: `result:${input.task.id}`,
        collaborationId: input.collaborationId,
        planId: input.plan.id,
        batchId: input.task.batchId,
        taskId: input.task.id,
        participantId: input.participant.id,
        agentId: input.participant.agentId,
        order: input.task.order,
        success: false,
        status: CollaborationStatuses.FAILED,
        message,
        attributes: Object.freeze({
          role: input.participant.role,
        }),
        error: createCollaborationError({
          code: "dispatch_failed",
          message,
          participantId: input.participant.id,
          taskId: input.task.id,
          occurredAt: completedAt,
        }),
        metadata: EMPTY_COLLABORATION_METADATA,
        startedAt,
        completedAt,
        durationMs: Math.max(0, input.nowMs() - startMs),
        frozenAt: completedAt,
      });
    }
  }
}

/**
 * Default shell handler — returns orchestration metadata only.
 */
export const defaultShellHandler: CollaborationParticipantHandler = (input) => {
  const startMs = input.nowMs();
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
    message: `Participant ${input.participant.agentId} dispatched via collaboration shell`,
    attributes: Object.freeze({
      role: input.participant.role,
      intent: input.request.intent,
      executor: "shell",
    }),
    error: null,
    metadata: {
      tags: Object.freeze(["agent-collaboration", "shell-handler"]),
      attributes: Object.freeze({
        agentId: input.participant.agentId,
      }),
    },
    startedAt: input.startedAt,
    completedAt,
    durationMs: Math.max(0, input.nowMs() - startMs),
    frozenAt: completedAt,
  });
};

export function createCollaborationDispatcher(
  deps: CollaborationDispatcherDeps = {},
): CollaborationDispatcher {
  return new CollaborationDispatcher(deps);
}
