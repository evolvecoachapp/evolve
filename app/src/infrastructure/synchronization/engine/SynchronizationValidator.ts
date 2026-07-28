import type { SynchronizationOperation } from "../models/SynchronizationOperation";
import type { SynchronizationQueue } from "../models/SynchronizationQueue";
import type { SynchronizationBatch } from "../models/SynchronizationBatch";
import type { SynchronizationConflict } from "../models/SynchronizationConflict";
import type { SynchronizationState } from "../models/SynchronizationState";
import type { SynchronizationCheckpoint } from "../models/SynchronizationCheckpoint";
import {
  createSynchronizationValidation,
  type SynchronizationValidation,
} from "../models/SynchronizationResult";
import {
  isSynchronizationOperationStatus,
  isSynchronizationOperationType,
} from "../models/SynchronizationOperation";
import { canTransitionSynchronizationState } from "../state/SynchronizationLifecycle";
import { isSynchronizationConflictType } from "../models/SynchronizationConflict";
import { isSynchronizationPolicy } from "../models/SynchronizationPolicy";
import type { SynchronizationPolicy } from "../models/SynchronizationPolicy";

/**
 * Field-level synchronization validation.
 * Covers duplicate operations, invalid queue, invalid state,
 * missing metadata, and invalid transitions.
 */
export class SynchronizationValidator {
  validateOperation(
    operation: SynchronizationOperation | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!operation) {
      errors.push("invalid operation");
      return createSynchronizationValidation(errors);
    }

    const missing: string[] = [];
    if (!operation.operationId || operation.operationId.trim().length === 0) {
      missing.push("operationId");
    }
    if (!operation.createdAt || operation.createdAt.trim().length === 0) {
      missing.push("createdAt");
    }
    if (!operation.updatedAt || operation.updatedAt.trim().length === 0) {
      missing.push("updatedAt");
    }
    if (!operation.metadata || typeof operation.metadata !== "object") {
      missing.push("metadata");
    }
    if (missing.length > 0) {
      errors.push(`missing immutable fields: ${missing.join(", ")}`);
    }

    if (!isSynchronizationOperationType(operation.type)) {
      errors.push(`invalid operation type: ${String(operation.type)}`);
    }
    if (!isSynchronizationOperationStatus(operation.status)) {
      errors.push(`invalid operation status: ${String(operation.status)}`);
    }

    return createSynchronizationValidation(errors);
  }

  validateQueue(
    queue: SynchronizationQueue | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!queue) {
      errors.push("invalid queue");
      return createSynchronizationValidation(errors);
    }
    if (!queue.queueId || queue.queueId.trim().length === 0) {
      errors.push("missing immutable fields: queueId");
    }
    if (!Array.isArray(queue.operations)) {
      errors.push("invalid queue");
    } else {
      if (queue.size !== queue.operations.length) {
        errors.push("invalid queue: size mismatch");
      }
      const seen = new Set<string>();
      for (const operation of queue.operations) {
        const opValidation = this.validateOperation(operation);
        errors.push(...opValidation.errors);
        if (seen.has(operation.operationId)) {
          errors.push(`duplicate operation: ${operation.operationId}`);
        }
        seen.add(operation.operationId);
      }
    }
    return createSynchronizationValidation(errors);
  }

  validateState(
    state: SynchronizationState | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!state) {
      errors.push("invalid state");
      return createSynchronizationValidation(errors);
    }
    return createSynchronizationValidation(errors);
  }

  validateTransition(
    from: SynchronizationState,
    to: SynchronizationState,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!canTransitionSynchronizationState(from, to)) {
      errors.push(`invalid transition: ${from} -> ${to}`);
    }
    return createSynchronizationValidation(errors);
  }

  validateBatch(
    batch: SynchronizationBatch | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!batch) {
      errors.push("invalid batch");
      return createSynchronizationValidation(errors);
    }
    if (!batch.batchId || batch.batchId.trim().length === 0) {
      errors.push("missing immutable fields: batchId");
    }
    if (!batch.metadata || typeof batch.metadata !== "object") {
      errors.push("missing metadata");
    }
    if (!Array.isArray(batch.operationIds) || batch.operationIds.length === 0) {
      errors.push("invalid batch: empty operationIds");
    }
    return createSynchronizationValidation(errors);
  }

  validateConflict(
    conflict: SynchronizationConflict | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!conflict) {
      errors.push("invalid conflict");
      return createSynchronizationValidation(errors);
    }
    if (!conflict.conflictId || conflict.conflictId.trim().length === 0) {
      errors.push("missing immutable fields: conflictId");
    }
    if (!conflict.entityKey || conflict.entityKey.trim().length === 0) {
      errors.push("missing immutable fields: entityKey");
    }
    if (!isSynchronizationConflictType(conflict.type)) {
      errors.push(`invalid conflict type: ${String(conflict.type)}`);
    }
    if (!conflict.metadata || typeof conflict.metadata !== "object") {
      errors.push("missing metadata");
    }
    return createSynchronizationValidation(errors);
  }

  validateCheckpoint(
    checkpoint: SynchronizationCheckpoint | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!checkpoint) {
      errors.push("invalid checkpoint");
      return createSynchronizationValidation(errors);
    }
    if (!checkpoint.checkpointId || checkpoint.checkpointId.trim().length === 0) {
      errors.push("missing immutable fields: checkpointId");
    }
    if (!checkpoint.metadata || typeof checkpoint.metadata !== "object") {
      errors.push("missing metadata");
    }
    return createSynchronizationValidation(errors);
  }

  validatePolicy(
    policy: SynchronizationPolicy | null | undefined,
  ): SynchronizationValidation {
    const errors: string[] = [];
    if (!policy || !isSynchronizationPolicy(policy)) {
      errors.push("invalid policy");
    }
    return createSynchronizationValidation(errors);
  }
}

export function createSynchronizationValidator(): SynchronizationValidator {
  return new SynchronizationValidator();
}
