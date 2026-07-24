import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionResult } from "../models/SessionResult";
import { EMPTY_SESSION_VALIDATION } from "../models/SessionValidation";
import { freezeResult } from "../utils/FreezeSessionState";

export type SessionResultInput = Pick<
  SessionResult,
  "id" | "operation" | "success" | "startedAt" | "completedAt"
> &
  Partial<
    Omit<
      SessionResult,
      "id" | "operation" | "success" | "startedAt" | "completedAt" | "frozenAt"
    >
  >;

export function buildSessionResult(partial: SessionResultInput): SessionResult {
  return freezeResult({
    id: partial.id,
    operation: partial.operation,
    success: partial.success,
    message: partial.message ?? null,
    sessionId: partial.sessionId ?? null,
    request: partial.request ?? null,
    context: partial.context ?? null,
    response: partial.response ?? null,
    summary: partial.summary ?? null,
    snapshot: partial.snapshot ?? null,
    descriptor: partial.descriptor ?? null,
    validation: partial.validation ?? EMPTY_SESSION_VALIDATION,
    error: partial.error ?? null,
    events: Object.freeze([...(partial.events ?? [])]),
    metadata: partial.metadata ?? EMPTY_SESSION_METADATA,
    startedAt: partial.startedAt,
    completedAt: partial.completedAt,
    frozenAt: partial.completedAt,
  });
}
