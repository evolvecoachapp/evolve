import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionSnapshot } from "../models/SessionSnapshot";
import { freezeSnapshot } from "../utils/FreezeSessionState";

export function buildSessionSnapshot(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly request?: SessionSnapshot["request"];
  readonly context?: SessionSnapshot["context"];
  readonly response?: SessionSnapshot["response"];
  readonly summary?: SessionSnapshot["summary"];
  readonly timeline?: SessionSnapshot["timeline"];
  readonly createdAt: string;
}): SessionSnapshot {
  return freezeSnapshot({
    id: input.id,
    sessionId: input.sessionId,
    request: input.request ?? null,
    context: input.context ?? null,
    response: input.response ?? null,
    summary: input.summary ?? null,
    timeline: input.timeline ?? null,
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
