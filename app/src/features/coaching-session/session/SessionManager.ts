import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import { SessionPhases } from "../models/SessionPhase";
import type { SessionContext } from "../models/SessionContext";
import {
  SessionStatuses,
  type SessionState,
} from "../models/SessionState";
import { freezeState } from "../utils/FreezeSessionState";

/**
 * In-memory session registry for orchestration only — no persistence.
 */
export class SessionManager {
  private readonly contexts = new Map<string, SessionContext>();

  get(sessionId: string): SessionContext | null {
    return this.contexts.get(sessionId) ?? null;
  }

  put(context: SessionContext): void {
    this.contexts.set(context.sessionId, context);
  }

  has(sessionId: string): boolean {
    return this.contexts.has(sessionId);
  }

  createState(input: {
    readonly id: string;
    readonly sessionId: string;
    readonly updatedAt: string;
  }): SessionState {
    return freezeState({
      id: input.id,
      sessionId: input.sessionId,
      status: SessionStatuses.IDLE,
      phase: SessionPhases.IDLE,
      turnCount: 0,
      lastRequestId: null,
      errorMessage: null,
      metadata: EMPTY_SESSION_METADATA,
      updatedAt: input.updatedAt,
    });
  }

  updateState(input: {
    readonly state: SessionState;
    readonly status: SessionState["status"];
    readonly phase: SessionState["phase"];
    readonly turnCount?: number;
    readonly lastRequestId?: string | null;
    readonly errorMessage?: string | null;
    readonly updatedAt: string;
  }): SessionState {
    return freezeState({
      ...input.state,
      status: input.status,
      phase: input.phase,
      turnCount: input.turnCount ?? input.state.turnCount,
      lastRequestId:
        input.lastRequestId !== undefined
          ? input.lastRequestId
          : input.state.lastRequestId,
      errorMessage:
        input.errorMessage !== undefined
          ? input.errorMessage
          : input.state.errorMessage,
      updatedAt: input.updatedAt,
    });
  }
}

export function createSessionManager(): SessionManager {
  return new SessionManager();
}
