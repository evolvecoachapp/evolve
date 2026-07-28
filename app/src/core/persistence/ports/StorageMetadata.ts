import type { PersistenceCapability } from "../contracts/PersistenceCapability";

/**
 * Immutable storage backend metadata descriptor.
 * Contract type only — no I/O.
 */
export interface StorageMetadata {
  readonly backendId: string;
  readonly version: string;
  readonly capabilities: readonly PersistenceCapability[];
  readonly createdAt: string;
  readonly labels: Readonly<Record<string, string>>;
}

export function createStorageMetadata(input: {
  readonly backendId: string;
  readonly version: string;
  readonly capabilities: readonly PersistenceCapability[];
  readonly createdAt: string;
  readonly labels?: Readonly<Record<string, string>>;
}): StorageMetadata {
  return Object.freeze({
    backendId: input.backendId,
    version: input.version,
    capabilities: Object.freeze([...input.capabilities]),
    createdAt: input.createdAt,
    labels: Object.freeze({ ...(input.labels ?? {}) }),
  });
}
