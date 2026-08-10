import type { RuntimeSessionResult } from "./RuntimeSessionResult";
import type { RuntimeSessionStatus } from "./RuntimeSessionStatus";
import { RUNTIME_SESSION_STATUS } from "./RuntimeSessionStatus";
import type { RuntimeSessionError } from "./RuntimeSessionError";

export interface RuntimeSessionState {
  readonly status: RuntimeSessionStatus;
  readonly result: RuntimeSessionResult | null;
  readonly error: RuntimeSessionError | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export interface CreateRuntimeSessionStateInput {
  readonly status: RuntimeSessionStatus;
  readonly result?: RuntimeSessionResult | null;
  readonly error?: RuntimeSessionError | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export function createRuntimeSessionState(
  input: CreateRuntimeSessionStateInput,
): RuntimeSessionState {
  return Object.freeze({
    status: input.status,
    result: input.result ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  });
}

export function createIdleRuntimeSessionState(): RuntimeSessionState {
  return createRuntimeSessionState({
    status: RUNTIME_SESSION_STATUS.idle,
  });
}
