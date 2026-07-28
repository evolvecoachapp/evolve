import type { SynchronizationMetadata } from "./SynchronizationMetadata";
import { createSynchronizationMetadata } from "./SynchronizationMetadata";

/**
 * Deterministic synchronization operation types.
 * Representation / queueing only — no remote execution.
 */
export const SYNCHRONIZATION_OPERATION_TYPES = [
  "push",
  "pull",
  "sync",
] as const;

export type SynchronizationOperationType =
  (typeof SYNCHRONIZATION_OPERATION_TYPES)[number];

export function isSynchronizationOperationType(
  value: string,
): value is SynchronizationOperationType {
  return (SYNCHRONIZATION_OPERATION_TYPES as readonly string[]).includes(value);
}

export const SYNCHRONIZATION_OPERATION_STATUSES = [
  "pending",
  "completed",
  "failed",
  "cancelled",
] as const;

export type SynchronizationOperationStatus =
  (typeof SYNCHRONIZATION_OPERATION_STATUSES)[number];

export function isSynchronizationOperationStatus(
  value: string,
): value is SynchronizationOperationStatus {
  return (SYNCHRONIZATION_OPERATION_STATUSES as readonly string[]).includes(
    value,
  );
}

/**
 * Immutable synchronization operation.
 */
export interface SynchronizationOperation {
  readonly operationId: string;
  readonly type: SynchronizationOperationType;
  readonly status: SynchronizationOperationStatus;
  readonly payload: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly retryCount: number;
  readonly metadata: SynchronizationMetadata;
}

export function createSynchronizationOperation(input: {
  readonly operationId: string;
  readonly type: SynchronizationOperationType;
  readonly status?: SynchronizationOperationStatus;
  readonly payload?: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly retryCount?: number;
  readonly metadata?: Readonly<Record<string, string>>;
}): SynchronizationOperation {
  return Object.freeze({
    operationId: input.operationId,
    type: input.type,
    status: input.status ?? "pending",
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt ?? input.createdAt,
    retryCount: input.retryCount ?? 0,
    metadata: createSynchronizationMetadata(input.metadata ?? {}),
  });
}
