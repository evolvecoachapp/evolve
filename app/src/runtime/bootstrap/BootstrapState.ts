import type { BootstrapResult } from "./BootstrapResult";
import type { BootstrapStatus } from "./BootstrapStatus";
import { BOOTSTRAP_STATUS } from "./BootstrapStatus";
import type { RuntimeBootstrapError } from "./RuntimeBootstrapError";

export interface BootstrapState {
  readonly status: BootstrapStatus;
  readonly result: BootstrapResult | null;
  readonly error: RuntimeBootstrapError | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}

export interface CreateBootstrapStateInput {
  readonly status: BootstrapStatus;
  readonly result?: BootstrapResult | null;
  readonly error?: RuntimeBootstrapError | null;
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
}

export function createBootstrapState(
  input: CreateBootstrapStateInput,
): BootstrapState {
  return Object.freeze({
    status: input.status,
    result: input.result ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  });
}

export function createIdleBootstrapState(): BootstrapState {
  return createBootstrapState({ status: BOOTSTRAP_STATUS.idle });
}
