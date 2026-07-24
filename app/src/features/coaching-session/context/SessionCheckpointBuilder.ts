import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionCheckpoint } from "../models/SessionCheckpoint";
import type { SessionPhase } from "../models/SessionPhase";
import type { SessionStatus } from "../models/SessionState";
import { freezeCheckpoint } from "../utils/FreezeSessionState";

export function buildSessionCheckpoint(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly turnCount: number;
  readonly status: SessionStatus;
  readonly phase: SessionPhase;
  readonly lastRequestId: string | null;
  readonly lastResponseId: string | null;
  readonly createdAt: string;
}): SessionCheckpoint {
  return freezeCheckpoint({
    id: input.id,
    sessionId: input.sessionId,
    turnCount: input.turnCount,
    status: input.status,
    phase: input.phase,
    lastRequestId: input.lastRequestId,
    lastResponseId: input.lastResponseId,
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
