import { SessionPhases, type SessionPhase } from "../models/SessionPhase";
import {
  SessionStatuses,
  type SessionStatus,
} from "../models/SessionState";
import { SessionRequestKinds, type SessionRequestKind } from "../models/SessionRequest";

export interface TransitionResult {
  readonly allowed: boolean;
  readonly nextStatus: SessionStatus | null;
  readonly nextPhase: SessionPhase | null;
  readonly reason: string | null;
}

/**
 * Deterministic session state machine — orchestration transitions only.
 */
export class SessionStateMachine {
  transition(input: {
    readonly from: SessionStatus | null;
    readonly kind: SessionRequestKind;
  }): TransitionResult {
    const from = input.from ?? SessionStatuses.IDLE;

    if (input.kind === SessionRequestKinds.START) {
      if (from === SessionStatuses.IDLE || from === SessionStatuses.COMPLETED || from === SessionStatuses.FAILED) {
        return Object.freeze({
          allowed: true,
          nextStatus: SessionStatuses.ACTIVE,
          nextPhase: SessionPhases.INTERACT,
          reason: null,
        });
      }
      return Object.freeze({
        allowed: false,
        nextStatus: null,
        nextPhase: null,
        reason: `Cannot start from '${from}'.`,
      });
    }

    if (input.kind === SessionRequestKinds.CONTINUE) {
      if (from === SessionStatuses.ACTIVE || from === SessionStatuses.CONTINUING) {
        return Object.freeze({
          allowed: true,
          nextStatus: SessionStatuses.ACTIVE,
          nextPhase: SessionPhases.CONTINUE,
          reason: null,
        });
      }
      return Object.freeze({
        allowed: false,
        nextStatus: null,
        nextPhase: null,
        reason: `Cannot continue from '${from}'.`,
      });
    }

    if (input.kind === SessionRequestKinds.END) {
      if (
        from === SessionStatuses.ACTIVE ||
        from === SessionStatuses.CONTINUING ||
        from === SessionStatuses.STARTING
      ) {
        return Object.freeze({
          allowed: true,
          nextStatus: SessionStatuses.COMPLETED,
          nextPhase: SessionPhases.FINALIZE,
          reason: null,
        });
      }
      return Object.freeze({
        allowed: false,
        nextStatus: null,
        nextPhase: null,
        reason: `Cannot end from '${from}'.`,
      });
    }

    return Object.freeze({
      allowed: true,
      nextStatus: from,
      nextPhase: SessionPhases.IDLE,
      reason: null,
    });
  }
}

export function createSessionStateMachine(): SessionStateMachine {
  return new SessionStateMachine();
}
