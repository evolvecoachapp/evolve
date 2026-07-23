import type { CollaborationParticipant } from "./CollaborationParticipant";
import type { CollaborationPlan } from "./CollaborationPlan";
import type { CollaborationRequest } from "./CollaborationRequest";
import type { CollaborationTask } from "./CollaborationTask";
import type { ExecutionResult } from "./ExecutionResult";

/**
 * Injectable participant handler — orchestration invocation only.
 *
 * Domain agents supply handlers; default shell returns metadata only.
 * No networking. No providers. No persistence. No AI.
 */
export type CollaborationParticipantHandler = (input: {
  readonly request: CollaborationRequest;
  readonly plan: CollaborationPlan;
  readonly participant: CollaborationParticipant;
  readonly task: CollaborationTask;
  readonly startedAt: string;
  readonly clock: () => string;
  readonly nowMs: () => number;
}) => Promise<ExecutionResult> | ExecutionResult;
