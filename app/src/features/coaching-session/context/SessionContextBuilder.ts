import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionCheckpoint } from "../models/SessionCheckpoint";
import type { SessionContext } from "../models/SessionContext";
import type { SessionHistory } from "../models/SessionHistory";
import type { SessionLifecycle } from "../models/SessionLifecycle";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionState } from "../models/SessionState";
import { freezeContext } from "../utils/FreezeSessionState";

export function buildSessionContext(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly conversationId: string | null;
  readonly athleteId: string | null;
  readonly request: SessionRequest | null;
  readonly state: SessionState;
  readonly lifecycle: SessionLifecycle;
  readonly history: SessionHistory;
  readonly checkpoint: SessionCheckpoint | null;
  readonly createdAt: string;
}): SessionContext {
  return freezeContext({
    id: input.id,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    athleteId: input.athleteId,
    request: input.request,
    state: input.state,
    lifecycle: input.lifecycle,
    history: input.history,
    checkpoint: input.checkpoint,
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
