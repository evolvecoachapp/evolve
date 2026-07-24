import type { SessionCheckpoint } from "../models/SessionCheckpoint";
import type { SessionContext } from "../models/SessionContext";
import type { SessionEvent } from "../models/SessionEvent";
import type { SessionLifecycle } from "../models/SessionLifecycle";
import type { SessionRequest } from "../models/SessionRequest";
import type { SessionResponse } from "../models/SessionResponse";
import type { SessionState } from "../models/SessionState";
import { freezeContext } from "../utils/FreezeSessionState";
import { appendHistoryEntry } from "./SessionHistoryBuilder";

/**
 * Immutable context manager — returns new frozen context instances.
 * No persistence.
 */
export class SessionContextManager {
  withTurn(input: {
    readonly context: SessionContext;
    readonly entryId: string;
    readonly request: SessionRequest;
    readonly response: SessionResponse | null;
    readonly state: SessionState;
    readonly lifecycle: SessionLifecycle;
    readonly checkpoint: SessionCheckpoint | null;
    readonly events?: readonly SessionEvent[];
    readonly updatedAt: string;
  }): SessionContext {
    const history = appendHistoryEntry({
      history: input.context.history,
      entryId: input.entryId,
      request: input.request,
      response: input.response,
      events: input.events,
      updatedAt: input.updatedAt,
    });
    return freezeContext({
      ...input.context,
      request: input.request,
      state: input.state,
      lifecycle: input.lifecycle,
      history,
      checkpoint: input.checkpoint,
      frozenAt: input.updatedAt,
    });
  }
}

export function createSessionContextManager(): SessionContextManager {
  return new SessionContextManager();
}
