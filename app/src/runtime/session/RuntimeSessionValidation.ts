import type { RuntimeSessionState } from "./RuntimeSessionState";
import { RUNTIME_SESSION_STATUS } from "./RuntimeSessionStatus";
import { RuntimeSessionError } from "./RuntimeSessionError";

export function validateRuntimeSessionState(state: RuntimeSessionState): void {
  if (
    state.status === RUNTIME_SESSION_STATUS.ready &&
    state.result === null
  ) {
    throw new RuntimeSessionError(
      "Session state marked ready without a result",
      "invalid_session_state",
    );
  }

  if (
    state.status === RUNTIME_SESSION_STATUS.failed &&
    state.error === null
  ) {
    throw new RuntimeSessionError(
      "Session state marked failed without an error",
      "invalid_session_state",
    );
  }

  if (
    state.status === RUNTIME_SESSION_STATUS.starting &&
    state.completedAt !== null
  ) {
    throw new RuntimeSessionError(
      "Session state marked starting with a completion timestamp",
      "invalid_session_state",
    );
  }
}

export function validateRuntimeSessionCanStart(
  state: RuntimeSessionState,
): void {
  if (
    state.status === RUNTIME_SESSION_STATUS.starting ||
    state.status === RUNTIME_SESSION_STATUS.ready
  ) {
    throw new RuntimeSessionError(
      "Runtime session has already started",
      "session_already_started",
    );
  }
}
