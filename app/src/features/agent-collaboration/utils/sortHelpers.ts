import type { CollaborationParticipant } from "../models/CollaborationParticipant";
import type { CollaborationTask } from "../models/CollaborationTask";
import type { ExecutionBatch } from "../models/ExecutionBatch";
import type { ExecutionResult } from "../models/ExecutionResult";

/**
 * Deterministic participant sort: order asc, then agentId asc.
 */
export function sortParticipantsDeterministic(
  participants: readonly CollaborationParticipant[],
): readonly CollaborationParticipant[] {
  return Object.freeze(
    [...participants].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.agentId.localeCompare(b.agentId);
    }),
  );
}

/**
 * Deterministic task sort: order asc, then id asc.
 */
export function sortTasksDeterministic(
  tasks: readonly CollaborationTask[],
): readonly CollaborationTask[] {
  return Object.freeze(
    [...tasks].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.id.localeCompare(b.id);
    }),
  );
}

/**
 * Deterministic batch sort: order asc, then id asc.
 */
export function sortBatchesDeterministic(
  batches: readonly ExecutionBatch[],
): readonly ExecutionBatch[] {
  return Object.freeze(
    [...batches].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.id.localeCompare(b.id);
    }),
  );
}

/**
 * Deterministic execution result sort: order asc, then agentId asc.
 */
export function sortResultsDeterministic(
  results: readonly ExecutionResult[],
): readonly ExecutionResult[] {
  return Object.freeze(
    [...results].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.agentId.localeCompare(b.agentId);
    }),
  );
}
