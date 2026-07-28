import type { BackendMetadata } from "./BackendMetadata";
import { createBackendMetadata } from "./BackendMetadata";
import type { BackendStatus } from "./BackendStatus";

/**
 * Immutable backend health snapshot.
 */
export interface BackendHealth {
  readonly status: BackendStatus;
  readonly healthy: boolean;
  readonly checkedAt: string;
  readonly message: string | null;
  readonly metadata: BackendMetadata;
}

export function createBackendHealth(input: {
  readonly status: BackendStatus;
  readonly healthy: boolean;
  readonly checkedAt: string;
  readonly message?: string | null;
  readonly metadata?: Readonly<Record<string, string>>;
}): BackendHealth {
  return Object.freeze({
    status: input.status,
    healthy: input.healthy,
    checkedAt: input.checkedAt,
    message: input.message ?? null,
    metadata: createBackendMetadata(input.metadata ?? {}),
  });
}
