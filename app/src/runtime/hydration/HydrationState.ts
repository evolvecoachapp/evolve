import type { HydrationResult } from "./HydrationResult";
import type { HydrationStatus } from "./HydrationStatus";
import { HYDRATION_STATUS } from "./HydrationStatus";
import type { HydrationError } from "./HydrationError";

export interface HydrationState {
  readonly status: HydrationStatus;
  readonly result: HydrationResult | null;
  readonly error: HydrationError | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export interface CreateHydrationStateInput {
  readonly status: HydrationStatus;
  readonly result?: HydrationResult | null;
  readonly error?: HydrationError | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export function createHydrationState(
  input: CreateHydrationStateInput,
): HydrationState {
  return Object.freeze({
    status: input.status,
    result: input.result ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  });
}

export function createIdleHydrationState(): HydrationState {
  return createHydrationState({ status: HYDRATION_STATUS.idle });
}
