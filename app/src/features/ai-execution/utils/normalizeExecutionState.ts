import type { AIExecutionErrorSnapshot } from "../models/AIExecutionError";
import type { AIExecutionStage } from "../models/AIExecutionStage";
import type { AIExecutionState } from "../models/AIExecutionState";
import type { AIExecutionStatus } from "../models/AIExecutionStatus";
import { AIExecutionStatuses } from "../models/AIExecutionStatus";
import { freezeState } from "./freezeObjects";

const TERMINAL_STATUSES: ReadonlySet<AIExecutionStatus> = new Set([
  AIExecutionStatuses.SUCCEEDED,
  AIExecutionStatuses.FAILED,
  AIExecutionStatuses.CANCELLED,
  AIExecutionStatuses.TIMED_OUT,
]);

export function isTerminalStatus(status: AIExecutionStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function normalizeExecutionState(
  state: Partial<AIExecutionState> & {
    readonly status: AIExecutionStatus;
  },
): AIExecutionState {
  const completedAt =
    state.completedAt ??
    (isTerminalStatus(state.status) ? (state.startedAt ?? null) : null);

  return freezeState({
    status: state.status,
    stage: state.stage ?? null,
    startedAt: state.startedAt ?? null,
    completedAt,
    error: state.error ?? null,
  });
}

export function transitionState(
  current: AIExecutionState,
  next: {
    readonly status: AIExecutionStatus;
    readonly stage?: AIExecutionStage | null;
    readonly startedAt?: string | null;
    readonly completedAt?: string | null;
    readonly error?: AIExecutionErrorSnapshot | null;
  },
): AIExecutionState {
  return normalizeExecutionState({
    status: next.status,
    stage: next.stage !== undefined ? next.stage : current.stage,
    startedAt:
      next.startedAt !== undefined ? next.startedAt : current.startedAt,
    completedAt:
      next.completedAt !== undefined ? next.completedAt : current.completedAt,
    error: next.error !== undefined ? next.error : current.error,
  });
}
