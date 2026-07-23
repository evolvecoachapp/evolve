import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationRequest } from "../models/CollaborationRequest";
import type { CollaborationTask } from "../models/CollaborationTask";
import type { ExecutionBatch } from "../models/ExecutionBatch";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { freezeBatch, freezeTask } from "../utils/FreezeCollaborationState";

/**
 * Builds ordered tasks and a single sequential execution batch.
 * Planning only — never executes.
 */
export class ExecutionPlanner {
  plan(input: {
    readonly planId: string;
    readonly request: CollaborationRequest;
    readonly participants: readonly CollaborationParticipant[];
  }): {
    readonly tasks: readonly CollaborationTask[];
    readonly batches: readonly ExecutionBatch[];
  } {
    const batchId = `batch:${input.planId}:1`;
    const tasks = Object.freeze(
      input.participants.map((participant) =>
        freezeTask({
          id: `task:${input.planId}:${participant.agentId}`,
          participantId: participant.id,
          agentId: participant.agentId,
          order: participant.order,
          batchId,
          intent: input.request.intent,
          status: CollaborationStatuses.PLANNING,
          attributes: Object.freeze({
            role: participant.role,
            required: participant.required,
          }),
          metadata: EMPTY_COLLABORATION_METADATA,
        }),
      ),
    );

    const batches = Object.freeze([
      freezeBatch({
        id: batchId,
        planId: input.planId,
        order: 1,
        taskIds: Object.freeze(tasks.map((t) => t.id)),
        status: CollaborationStatuses.PLANNING,
        metadata: EMPTY_COLLABORATION_METADATA,
      }),
    ]);

    return { tasks, batches };
  }
}

export function createExecutionPlanner(): ExecutionPlanner {
  return new ExecutionPlanner();
}
