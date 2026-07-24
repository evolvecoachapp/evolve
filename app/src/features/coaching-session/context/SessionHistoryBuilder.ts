import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionEvent } from "../models/SessionEvent";
import type {
  SessionHistory,
  SessionHistoryEntry,
} from "../models/SessionHistory";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResponse } from "../models/SessionResponse";
import { freezeHistory } from "../utils/FreezeSessionState";

export function buildEmptySessionHistory(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly createdAt: string;
}): SessionHistory {
  return freezeHistory({
    id: input.id,
    sessionId: input.sessionId,
    entries: Object.freeze([]),
    events: Object.freeze([]),
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  });
}

export function appendHistoryEntry(input: {
  readonly history: SessionHistory;
  readonly entryId: string;
  readonly request: SessionRequest;
  readonly response: SessionResponse | null;
  readonly events?: readonly SessionEvent[];
  readonly updatedAt: string;
}): SessionHistory {
  const entry: SessionHistoryEntry = Object.freeze({
    id: input.entryId,
    request: input.request,
    response: input.response,
    createdAt: input.updatedAt,
  });
  return freezeHistory({
    ...input.history,
    entries: Object.freeze([...input.history.entries, entry]),
    events: Object.freeze([
      ...input.history.events,
      ...(input.events ?? []),
    ]),
    updatedAt: input.updatedAt,
  });
}
