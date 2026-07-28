import type { BackendMetadata } from "./BackendMetadata";
import { createBackendMetadata } from "./BackendMetadata";
import type { BackendRoute } from "./BackendRoute";

/**
 * Immutable backend request representation.
 * No networking. No serialization. No HTTP.
 */
export interface BackendRequest {
  readonly requestId: string;
  readonly route: BackendRoute;
  readonly operation: string;
  readonly payload: Readonly<Record<string, string>>;
  readonly metadata: BackendMetadata;
}

export function createBackendRequest(input: {
  readonly requestId: string;
  readonly route: BackendRoute;
  readonly operation?: string;
  readonly payload?: Readonly<Record<string, string>>;
  readonly metadata?: Readonly<Record<string, string>>;
}): BackendRequest {
  return Object.freeze({
    requestId: input.requestId,
    route: input.route,
    operation: input.operation ?? "dispatch",
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    metadata: createBackendMetadata(input.metadata ?? {}),
  });
}
