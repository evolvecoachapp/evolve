/**
 * Immutable synchronization capability descriptors.
 * Capabilities only — no runtime probing, no I/O.
 */
export interface SynchronizationCapabilities {
  readonly supportsOffline: boolean;
  readonly supportsEncryption: boolean;
  readonly supportsBatch: boolean;
  readonly supportsConflicts: boolean;
  readonly supportsCheckpoint: boolean;
  readonly supportsQueue: boolean;
}

export function createSynchronizationCapabilities(
  input: Partial<SynchronizationCapabilities> = {},
): SynchronizationCapabilities {
  return Object.freeze({
    supportsOffline: input.supportsOffline ?? true,
    supportsEncryption: input.supportsEncryption ?? false,
    supportsBatch: input.supportsBatch ?? true,
    supportsConflicts: input.supportsConflicts ?? true,
    supportsCheckpoint: input.supportsCheckpoint ?? true,
    supportsQueue: input.supportsQueue ?? true,
  });
}

export const LOCAL_SYNCHRONIZATION_CAPABILITIES =
  createSynchronizationCapabilities({
    supportsOffline: true,
    supportsEncryption: false,
    supportsBatch: true,
    supportsConflicts: true,
    supportsCheckpoint: true,
    supportsQueue: true,
  });
