import type { BackendMetadata } from "./BackendMetadata";
import { createBackendMetadata } from "./BackendMetadata";
import type { BackendRoute } from "./BackendRoute";

/**
 * Immutable backend endpoint descriptor.
 */
export interface BackendEndpoint {
  readonly endpointId: string;
  readonly route: BackendRoute;
  readonly name: string;
  readonly metadata: BackendMetadata;
}

export function createBackendEndpoint(input: {
  readonly endpointId: string;
  readonly route: BackendRoute;
  readonly name: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): BackendEndpoint {
  return Object.freeze({
    endpointId: input.endpointId,
    route: input.route,
    name: input.name,
    metadata: createBackendMetadata(input.metadata ?? {}),
  });
}
