import {
  SessionLifecycleStages,
  type SessionLifecycle,
} from "../models/SessionLifecycle";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import { SessionPhases, type SessionPhase } from "../models/SessionPhase";
import {
  SessionStatuses,
  type SessionStatus,
} from "../models/SessionState";
import { freezeLifecycle } from "../utils/FreezeSessionState";

/**
 * Owns immutable lifecycle descriptors — no business logic.
 */
export class SessionLifecycleManager {
  create(input: {
    readonly id: string;
    readonly sessionId: string;
    readonly updatedAt: string;
  }): SessionLifecycle {
    return freezeLifecycle({
      id: input.id,
      sessionId: input.sessionId,
      stage: SessionLifecycleStages.CREATED,
      status: SessionStatuses.IDLE,
      phase: SessionPhases.IDLE,
      startedAt: null,
      endedAt: null,
      metadata: EMPTY_SESSION_METADATA,
      updatedAt: input.updatedAt,
    });
  }

  advance(input: {
    readonly lifecycle: SessionLifecycle;
    readonly status: SessionStatus;
    readonly phase: SessionPhase;
    readonly updatedAt: string;
  }): SessionLifecycle {
    const stage =
      input.status === SessionStatuses.COMPLETED
        ? SessionLifecycleStages.ENDED
        : input.status === SessionStatuses.FAILED
          ? SessionLifecycleStages.FAILED
          : input.status === SessionStatuses.ACTIVE ||
              input.status === SessionStatuses.CONTINUING
            ? input.lifecycle.startedAt
              ? SessionLifecycleStages.CONTINUED
              : SessionLifecycleStages.STARTED
            : input.lifecycle.stage;

    return freezeLifecycle({
      ...input.lifecycle,
      stage:
        stage === SessionLifecycleStages.CONTINUED &&
        input.lifecycle.stage === SessionLifecycleStages.CREATED
          ? SessionLifecycleStages.STARTED
          : stage,
      status: input.status,
      phase: input.phase,
      startedAt:
        input.lifecycle.startedAt ??
        (input.status === SessionStatuses.ACTIVE ||
        input.status === SessionStatuses.CONTINUING
          ? input.updatedAt
          : null),
      endedAt:
        input.status === SessionStatuses.COMPLETED ||
        input.status === SessionStatuses.FAILED
          ? input.updatedAt
          : input.lifecycle.endedAt,
      updatedAt: input.updatedAt,
    });
  }
}

export function createSessionLifecycleManager(): SessionLifecycleManager {
  return new SessionLifecycleManager();
}
