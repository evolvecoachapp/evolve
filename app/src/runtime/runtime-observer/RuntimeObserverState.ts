import type { RuntimeObserverResult } from "./RuntimeObserverResult";
import type { RuntimeObserverStatus } from "./RuntimeObserverStatus";
import { RUNTIME_OBSERVER_STATUS } from "./RuntimeObserverStatus";
import type { RuntimeObserverError } from "./RuntimeObserverError";

export interface RuntimeObserverState {
  readonly status: RuntimeObserverStatus;
  readonly result: RuntimeObserverResult | null;
  readonly error: RuntimeObserverError | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly athleteIds: readonly string[];
}

export interface CreateRuntimeObserverStateInput {
  readonly status: RuntimeObserverStatus;
  readonly result?: RuntimeObserverResult | null;
  readonly error?: RuntimeObserverError | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
  readonly athleteIds?: readonly string[];
}

export function createRuntimeObserverState(
  input: CreateRuntimeObserverStateInput,
): RuntimeObserverState {
  return Object.freeze({
    status: input.status,
    result: input.result ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
    athleteIds: Object.freeze([...(input.athleteIds ?? [])]),
  });
}

export function createIdleRuntimeObserverState(): RuntimeObserverState {
  return createRuntimeObserverState({
    status: RUNTIME_OBSERVER_STATUS.idle,
  });
}
