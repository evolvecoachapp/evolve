import { SessionRequestKinds, type SessionRequest } from "../models/SessionRequest";
import { SessionStatuses, type SessionStatus } from "../models/SessionState";

export function isTerminalStatus(status: SessionStatus): boolean {
  return (
    status === SessionStatuses.COMPLETED || status === SessionStatuses.FAILED
  );
}

export function isActiveStatus(status: SessionStatus): boolean {
  return (
    status === SessionStatuses.ACTIVE || status === SessionStatuses.CONTINUING
  );
}

export function resolveSessionId(request: SessionRequest): string | null {
  if (request.kind === SessionRequestKinds.START) {
    return request.sessionId;
  }
  return request.sessionId;
}

export function nextTurnCount(current: number): number {
  return Math.max(0, current) + 1;
}
