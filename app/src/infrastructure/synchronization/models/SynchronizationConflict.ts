import type { SynchronizationMetadata } from "./SynchronizationMetadata";
import { createSynchronizationMetadata } from "./SynchronizationMetadata";

/**
 * Conflict representations only — no automatic resolution.
 */
export const SYNCHRONIZATION_CONFLICT_TYPES = [
  "LocalNewer",
  "RemoteNewer",
  "MergeRequired",
  "DeletedRemotely",
  "DeletedLocally",
  "VersionMismatch",
] as const;

export type SynchronizationConflictType =
  (typeof SYNCHRONIZATION_CONFLICT_TYPES)[number];

export function isSynchronizationConflictType(
  value: string,
): value is SynchronizationConflictType {
  return (SYNCHRONIZATION_CONFLICT_TYPES as readonly string[]).includes(value);
}

/**
 * Immutable synchronization conflict descriptor.
 */
export interface SynchronizationConflict {
  readonly conflictId: string;
  readonly type: SynchronizationConflictType;
  readonly entityKey: string;
  readonly localVersion: string | null;
  readonly remoteVersion: string | null;
  readonly createdAt: string;
  readonly metadata: SynchronizationMetadata;
}

export function createSynchronizationConflict(input: {
  readonly conflictId: string;
  readonly type: SynchronizationConflictType;
  readonly entityKey: string;
  readonly localVersion?: string | null;
  readonly remoteVersion?: string | null;
  readonly createdAt: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): SynchronizationConflict {
  return Object.freeze({
    conflictId: input.conflictId,
    type: input.type,
    entityKey: input.entityKey,
    localVersion: input.localVersion ?? null,
    remoteVersion: input.remoteVersion ?? null,
    createdAt: input.createdAt,
    metadata: createSynchronizationMetadata(input.metadata ?? {}),
  });
}
