import {
  createSynchronizationBatch,
  type SynchronizationBatch,
} from "../models/SynchronizationBatch";
import {
  createSynchronizationResult,
  type SynchronizationResult,
} from "../models/SynchronizationResult";
import type { SynchronizationQueueManager } from "../queue/SynchronizationQueueManager";
import type { SynchronizationStateManager } from "./SynchronizationStateManager";
import { createSynchronizationStatistics } from "../models/SynchronizationStatistics";

/**
 * Local batch orchestration only — no remote execution.
 */
export class SynchronizationBatchProcessor {
  private sequence = 0;
  private batches: readonly SynchronizationBatch[] = Object.freeze([]);

  constructor(
    private readonly queue: SynchronizationQueueManager,
    private readonly stateManager: SynchronizationStateManager,
  ) {}

  list(): readonly SynchronizationBatch[] {
    return this.batches;
  }

  createBatch(
    operationIds?: readonly string[],
  ): SynchronizationResult<SynchronizationBatch> {
    const ids =
      operationIds ??
      this.queue
        .snapshot()
        .operations.filter((op) => op.status === "pending")
        .map((op) => op.operationId);

    if (ids.length === 0) {
      return createSynchronizationResult({
        success: false,
        errorCode: "empty_batch",
        message: "Cannot create empty synchronization batch",
      });
    }

    const known = new Set(
      this.queue.snapshot().operations.map((op) => op.operationId),
    );
    for (const id of ids) {
      if (!known.has(id)) {
        return createSynchronizationResult({
          success: false,
          errorCode: "invalid_batch",
          message: `Unknown operation in batch: ${id}`,
        });
      }
    }

    const createdAt = this.nextTimestamp();
    const batch = createSynchronizationBatch({
      batchId: `local-batch-${this.sequence}`,
      operationIds: ids,
      state: "pending",
      createdAt,
    });
    this.batches = Object.freeze([...this.batches, batch]);
    this.stateManager.setStatistics(
      createSynchronizationStatistics({
        ...this.stateManager.getStatistics(),
        batchCount: this.batches.length,
        pendingCount: this.queue
          .snapshot()
          .operations.filter((op) => op.status === "pending").length,
      }),
    );

    return createSynchronizationResult({
      success: true,
      value: batch,
    });
  }

  /**
   * Marks a batch completed locally. Does not execute remote sync.
   */
  completeBatch(batchId: string): SynchronizationResult<SynchronizationBatch> {
    const index = this.batches.findIndex((batch) => batch.batchId === batchId);
    if (index < 0) {
      return createSynchronizationResult({
        success: false,
        errorCode: "batch_not_found",
        message: `Batch not found: ${batchId}`,
      });
    }

    const current = this.batches[index]!;
    const completed = createSynchronizationBatch({
      batchId: current.batchId,
      operationIds: current.operationIds,
      state: "completed",
      createdAt: current.createdAt,
      metadata: current.metadata,
    });
    const next = [...this.batches];
    next[index] = completed;
    this.batches = Object.freeze(next);

    return createSynchronizationResult({
      success: true,
      value: completed,
    });
  }

  private nextTimestamp(): string {
    const millis = String(this.sequence).padStart(3, "0");
    this.sequence += 1;
    return `1970-01-01T00:00:00.${millis}Z`;
  }
}

export function createSynchronizationBatchProcessor(
  queue: SynchronizationQueueManager,
  stateManager: SynchronizationStateManager,
): SynchronizationBatchProcessor {
  return new SynchronizationBatchProcessor(queue, stateManager);
}
