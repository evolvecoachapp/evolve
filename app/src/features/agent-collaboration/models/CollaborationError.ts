/**
 * Immutable collaboration orchestration error.
 */
export interface CollaborationError {
  readonly code: string;
  readonly message: string;
  readonly participantId: string | null;
  readonly taskId: string | null;
  readonly occurredAt: string;
}

export function createCollaborationError(input: {
  readonly code: string;
  readonly message: string;
  readonly participantId?: string | null;
  readonly taskId?: string | null;
  readonly occurredAt: string;
}): CollaborationError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    participantId: input.participantId ?? null,
    taskId: input.taskId ?? null,
    occurredAt: input.occurredAt,
  });
}
