import {
  createSynchronizationOperation,
  type SynchronizationOperation,
  type SynchronizationOperationType,
} from "../models/SynchronizationOperation";
import {
  createSynchronizationResult,
  type SynchronizationResult,
} from "../models/SynchronizationResult";
import type { SynchronizationQueueManager } from "../queue/SynchronizationQueueManager";

/**
 * Deterministic local operation orchestration.
 * No remote execution.
 */
export class SynchronizationOperations {
  private sequence = 0;

  constructor(private readonly queue: SynchronizationQueueManager) {}

  private nextTimestamp(): string {
    const seconds = String(this.sequence).padStart(2, "0");
    this.sequence += 1;
    return `1970-01-01T00:00:${seconds}.000Z`;
  }

  private nextOperationId(type: SynchronizationOperationType): string {
    return `local-op-${type}-${this.sequence}`;
  }

  enqueue(input: {
    readonly type: SynchronizationOperationType;
    readonly payload?: Readonly<Record<string, string>>;
    readonly metadata?: Readonly<Record<string, string>>;
    readonly operationId?: string;
  }): SynchronizationResult<SynchronizationOperation> {
    const existingIds = new Set(
      this.queue.snapshot().operations.map((op) => op.operationId),
    );
    const operationId =
      input.operationId ?? this.nextOperationId(input.type);
    if (existingIds.has(operationId)) {
      return createSynchronizationResult({
        success: false,
        errorCode: "duplicate_operation",
        message: `Duplicate operation: ${operationId}`,
      });
    }

    const createdAt = this.nextTimestamp();
    const operation = createSynchronizationOperation({
      operationId,
      type: input.type,
      status: "pending",
      payload: input.payload,
      createdAt,
      updatedAt: createdAt,
      metadata: input.metadata,
    });
    this.queue.enqueue(operation);
    return createSynchronizationResult({
      success: true,
      value: operation,
    });
  }

  dequeue(): SynchronizationResult<SynchronizationOperation | null> {
    const { operation } = this.queue.dequeue();
    return createSynchronizationResult({
      success: true,
      value: operation,
    });
  }

  peek(): SynchronizationResult<SynchronizationOperation | null> {
    return createSynchronizationResult({
      success: true,
      value: this.queue.peek(),
    });
  }

  markCompleted(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.updateStatus(operationId, "completed");
  }

  markFailed(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.updateStatus(operationId, "failed");
  }

  cancel(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.updateStatus(operationId, "cancelled");
  }

  clear(): SynchronizationResult<void> {
    this.queue.clear();
    return createSynchronizationResult({ success: true, value: null });
  }

  retry(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    const existing = this.queue.find(operationId);
    if (!existing) {
      return createSynchronizationResult({
        success: false,
        errorCode: "operation_not_found",
        message: `Operation not found: ${operationId}`,
      });
    }
    if (existing.status !== "failed" && existing.status !== "cancelled") {
      return createSynchronizationResult({
        success: false,
        errorCode: "invalid_retry",
        message: `Cannot retry operation in status: ${existing.status}`,
      });
    }

    const updatedAt = this.nextTimestamp();
    const updated = this.queue.update(operationId, (operation) =>
      createSynchronizationOperation({
        operationId: operation.operationId,
        type: operation.type,
        status: "pending",
        payload: operation.payload,
        createdAt: operation.createdAt,
        updatedAt,
        retryCount: operation.retryCount + 1,
        metadata: operation.metadata,
      }),
    );

    return createSynchronizationResult({
      success: true,
      value: updated,
    });
  }

  private updateStatus(
    operationId: string,
    status: "completed" | "failed" | "cancelled",
  ): SynchronizationResult<SynchronizationOperation> {
    const existing = this.queue.find(operationId);
    if (!existing) {
      return createSynchronizationResult({
        success: false,
        errorCode: "operation_not_found",
        message: `Operation not found: ${operationId}`,
      });
    }
    if (existing.status !== "pending") {
      return createSynchronizationResult({
        success: false,
        errorCode: "invalid_operation_status",
        message: `Cannot mark ${status} from status: ${existing.status}`,
      });
    }

    const updatedAt = this.nextTimestamp();
    const updated = this.queue.update(operationId, (operation) =>
      createSynchronizationOperation({
        operationId: operation.operationId,
        type: operation.type,
        status,
        payload: operation.payload,
        createdAt: operation.createdAt,
        updatedAt,
        retryCount: operation.retryCount,
        metadata: operation.metadata,
      }),
    );

    return createSynchronizationResult({
      success: true,
      value: updated,
    });
  }
}

export function createSynchronizationOperations(
  queue: SynchronizationQueueManager,
): SynchronizationOperations {
  return new SynchronizationOperations(queue);
}
