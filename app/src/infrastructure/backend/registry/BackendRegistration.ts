import type { BackendProviderToken } from "./BackendProviderToken";
import type { BackendMetadata } from "../models/BackendMetadata";
import { createBackendMetadata } from "../models/BackendMetadata";

/**
 * Immutable descriptor for a registered backend provider.
 */
export interface BackendRegistration {
  readonly token: BackendProviderToken;
  readonly name: string;
  readonly version: string;
  readonly providerId: BackendProviderToken;
  readonly metadata: BackendMetadata;
}

export function createBackendRegistration(input: {
  readonly token: BackendProviderToken;
  readonly name: string;
  readonly version: string;
  readonly providerId: BackendProviderToken;
  readonly metadata?: Readonly<Record<string, string>>;
}): BackendRegistration {
  return Object.freeze({
    token: input.token,
    name: input.name,
    version: input.version,
    providerId: input.providerId,
    metadata: createBackendMetadata(input.metadata ?? {}),
  });
}
