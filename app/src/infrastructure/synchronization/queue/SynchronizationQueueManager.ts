import {
  createSynchronizationQueue,
  type SynchronizationQueue,
} from "../models/SynchronizationQueue";
import type { SynchronizationOperation } from "../models/SynchronizationOperation";

/**
 * Immutable FIFO queue manager.
 * Replaces whole queue snapshots — no background workers.
 */
export class SynchronizationQueueManager {
  private queue: SynchronizationQueue;

  constructor(queueId: string = "local-queue") {
    this.queue = createSynchronizationQueue({ queueId, operations: [] });
  }

  snapshot(): SynchronizationQueue {
    return this.queue;
  }

  size(): number {
    return this.queue.size;
  }

  peek(): SynchronizationOperation | null {
    return this.queue.operations[0] ?? null;
  }

  enqueue(operation: SynchronizationOperation): SynchronizationQueue {
    this.queue = createSynchronizationQueue({
      queueId: this.queue.queueId,
      operations: [...this.queue.operations, operation],
    });
    return this.queue;
  }

  dequeue(): {
    readonly operation: SynchronizationOperation | null;
    readonly queue: SynchronizationQueue;
  } {
    if (this.queue.operations.length === 0) {
      return Object.freeze({
        operation: null,
        queue: this.queue,
      });
    }
    const [operation, ...rest] = this.queue.operations;
    this.queue = createSynchronizationQueue({
      queueId: this.queue.queueId,
      operations: rest,
    });
    return Object.freeze({
      operation: operation ?? null,
      queue: this.queue,
    });
  }

  replace(operations: readonly SynchronizationOperation[]): SynchronizationQueue {
    this.queue = createSynchronizationQueue({
      queueId: this.queue.queueId,
      operations,
    });
    return this.queue;
  }

  update(
    operationId: string,
    updater: (operation: SynchronizationOperation) => SynchronizationOperation,
  ): SynchronizationOperation | null {
    let updated: SynchronizationOperation | null = null;
    const operations = this.queue.operations.map((operation) => {
      if (operation.operationId !== operationId) {
        return operation;
      }
      updated = updater(operation);
      return updated;
    });
    if (updated === null) {
      return null;
    }
    this.queue = createSynchronizationQueue({
      queueId: this.queue.queueId,
      operations,
    });
    return updated;
  }

  find(operationId: string): SynchronizationOperation | null {
    return (
      this.queue.operations.find(
        (operation) => operation.operationId === operationId,
      ) ?? null
    );
  }

  clear(): SynchronizationQueue {
    this.queue = createSynchronizationQueue({
      queueId: this.queue.queueId,
      operations: [],
    });
    return this.queue;
  }
}

export function createSynchronizationQueueManager(
  queueId?: string,
): SynchronizationQueueManager {
  return new SynchronizationQueueManager(queueId);
}
