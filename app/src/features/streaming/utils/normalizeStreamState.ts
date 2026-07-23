import type { StreamState } from "../models/StreamState";
import type { StreamStatus } from "../models/StreamStatus";
import {
  isTerminalStreamStatus,
  StreamStatuses,
} from "../models/StreamStatus";
import { freezeState } from "./freezeObjects";

export { isTerminalStreamStatus };

/**
 * Allowed status transitions for the streaming foundation.
 */
export const STREAM_STATUS_TRANSITIONS: Readonly<
  Record<StreamStatus, readonly StreamStatus[]>
> = Object.freeze({
  [StreamStatuses.PENDING]: Object.freeze([
    StreamStatuses.STARTING,
    StreamStatuses.CANCELLED,
    StreamStatuses.FAILED,
  ]),
  [StreamStatuses.STARTING]: Object.freeze([
    StreamStatuses.STREAMING,
    StreamStatuses.CANCELLED,
    StreamStatuses.FAILED,
  ]),
  [StreamStatuses.STREAMING]: Object.freeze([
    StreamStatuses.COMPLETING,
    StreamStatuses.CANCELLED,
    StreamStatuses.FAILED,
    StreamStatuses.STREAMING,
  ]),
  [StreamStatuses.COMPLETING]: Object.freeze([
    StreamStatuses.COMPLETED,
    StreamStatuses.FAILED,
  ]),
  [StreamStatuses.COMPLETED]: Object.freeze([] as StreamStatus[]),
  [StreamStatuses.CANCELLED]: Object.freeze([] as StreamStatus[]),
  [StreamStatuses.FAILED]: Object.freeze([] as StreamStatus[]),
});

export function canTransitionStreamStatus(
  from: StreamStatus,
  to: StreamStatus,
): boolean {
  if (from === to && from === StreamStatuses.STREAMING) {
    return true;
  }
  return STREAM_STATUS_TRANSITIONS[from].includes(to);
}

export function normalizeStreamState(state: StreamState): StreamState {
  return freezeState({
    ...state,
    content: state.content ?? "",
    lastChunkIndex: state.lastChunkIndex ?? null,
    validationIssues: Object.freeze([...(state.validationIssues ?? [])]),
  });
}

export function transitionStreamState(
  state: StreamState,
  status: StreamStatus,
  updatedAt: string,
): StreamState {
  return freezeState({
    ...state,
    status,
    updatedAt,
    completedAt: isTerminalStreamStatus(status)
      ? (state.completedAt ?? updatedAt)
      : state.completedAt,
  });
}
