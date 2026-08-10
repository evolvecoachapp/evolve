import type { RuntimeWriteThroughResult } from "./RuntimeWriteThroughResult";
import type { RuntimeWriteThroughStatus } from "./RuntimeWriteThroughStatus";
import { RUNTIME_WRITE_THROUGH_STATUS } from "./RuntimeWriteThroughStatus";
import type { RuntimeWriteThroughError } from "./RuntimeWriteThroughError";

export interface RuntimeWriteThroughState {
  readonly status: RuntimeWriteThroughStatus;
  readonly result: RuntimeWriteThroughResult | null;
  readonly error: RuntimeWriteThroughError | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export interface CreateRuntimeWriteThroughStateInput {
  readonly status: RuntimeWriteThroughStatus;
  readonly result?: RuntimeWriteThroughResult | null;
  readonly error?: RuntimeWriteThroughError | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export function createRuntimeWriteThroughState(
  input: CreateRuntimeWriteThroughStateInput,
): RuntimeWriteThroughState {
  return Object.freeze({
    status: input.status,
    result: input.result ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  });
}

export function createIdleRuntimeWriteThroughState(): RuntimeWriteThroughState {
  return createRuntimeWriteThroughState({
    status: RUNTIME_WRITE_THROUGH_STATUS.idle,
  });
}
