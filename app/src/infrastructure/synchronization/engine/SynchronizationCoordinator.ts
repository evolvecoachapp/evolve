import type { SynchronizationOperations } from "../operations/SynchronizationOperations";
import type { SynchronizationQueueManager } from "../queue/SynchronizationQueueManager";
import type { SynchronizationStateManager } from "./SynchronizationStateManager";
import type { SynchronizationBatchProcessor } from "./SynchronizationBatchProcessor";
import type { SynchronizationValidator } from "./SynchronizationValidator";
import type { SynchronizationState } from "../models/SynchronizationState";
import type { SynchronizationPolicy } from "../models/SynchronizationPolicy";
import type { SynchronizationConflict } from "../models/SynchronizationConflict";
import {
  createSynchronizationResult,
  type SynchronizationResult,
} from "../models/SynchronizationResult";
import { createSynchronizationStatistics } from "../models/SynchronizationStatistics";
import type { SynchronizationOperationType } from "../models/SynchronizationOperation";
import type { SynchronizationBatch } from "../models/SynchronizationBatch";
import type { SynchronizationOperation } from "../models/SynchronizationOperation";
import type { SynchronizationQueue } from "../models/SynchronizationQueue";
import type { SynchronizationStatistics } from "../models/SynchronizationStatistics";
import type { SynchronizationCheckpoint } from "../models/SynchronizationCheckpoint";

/**
 * Coordinates queue, state, batch, and validation without remote execution.
 */
export class SynchronizationCoordinator {
  constructor(
    private readonly queue: SynchronizationQueueManager,
    private readonly operations: SynchronizationOperations,
    private readonly stateManager: SynchronizationStateManager,
    private readonly batchProcessor: SynchronizationBatchProcessor,
    private readonly validator: SynchronizationValidator,
  ) {}

  getQueue(): SynchronizationQueue {
    return this.queue.snapshot();
  }

  getState(): SynchronizationState {
    return this.stateManager.getState();
  }

  getStatistics(): SynchronizationStatistics {
    return this.refreshStatistics();
  }

  getPolicy(): SynchronizationPolicy {
    return this.stateManager.getPolicy();
  }

  getConflicts(): readonly SynchronizationConflict[] {
    return this.stateManager.getConflicts();
  }

  getCheckpoint(): SynchronizationCheckpoint | null {
    return this.stateManager.getCheckpoint();
  }

  setPolicy(policy: SynchronizationPolicy): SynchronizationResult<SynchronizationPolicy> {
    const validation = this.validator.validatePolicy(policy);
    if (!validation.valid) {
      return createSynchronizationResult({
        success: false,
        errorCode: "invalid_policy",
        message: validation.errors.join("; "),
      });
    }
    this.stateManager.setPolicy(policy);
    return createSynchronizationResult({ success: true, value: policy });
  }

  enqueue(input: {
    readonly type: SynchronizationOperationType;
    readonly payload?: Readonly<Record<string, string>>;
    readonly metadata?: Readonly<Record<string, string>>;
    readonly operationId?: string;
  }): SynchronizationResult<SynchronizationOperation> {
    const result = this.operations.enqueue(input);
    if (result.success) {
      if (this.stateManager.getState() === "idle") {
        this.stateManager.transition("pending");
      }
      this.refreshStatistics();
    }
    return result;
  }

  dequeue(): SynchronizationResult<SynchronizationOperation | null> {
    const result = this.operations.dequeue();
    this.refreshStatistics();
    return result;
  }

  peek(): SynchronizationResult<SynchronizationOperation | null> {
    return this.operations.peek();
  }

  markCompleted(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    const result = this.operations.markCompleted(operationId);
    this.refreshStatistics();
    return result;
  }

  markFailed(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    const result = this.operations.markFailed(operationId);
    this.refreshStatistics();
    return result;
  }

  cancel(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    const result = this.operations.cancel(operationId);
    this.refreshStatistics();
    return result;
  }

  clear(): SynchronizationResult<void> {
    const result = this.operations.clear();
    this.stateManager.forceState("idle");
    this.refreshStatistics();
    return result;
  }

  retry(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    const result = this.operations.retry(operationId);
    if (result.success && this.stateManager.getState() === "idle") {
      this.stateManager.transition("pending");
    }
    this.refreshStatistics();
    return result;
  }

  createBatch(
    operationIds?: readonly string[],
  ): SynchronizationResult<SynchronizationBatch> {
    return this.batchProcessor.createBatch(operationIds);
  }

  completeBatch(batchId: string): SynchronizationResult<SynchronizationBatch> {
    return this.batchProcessor.completeBatch(batchId);
  }

  transition(
    to: SynchronizationState,
  ): SynchronizationResult<SynchronizationState> {
    const from = this.stateManager.getState();
    const validation = this.validator.validateTransition(from, to);
    if (!validation.valid) {
      return createSynchronizationResult({
        success: false,
        errorCode: "invalid_transition",
        message: validation.errors.join("; "),
      });
    }
    this.stateManager.transition(to);
    if (to === "completed" || to === "failed" || to === "paused") {
      this.stateManager.recordCheckpoint(to);
    }
    return createSynchronizationResult({
      success: true,
      value: this.stateManager.getState(),
    });
  }

  recordConflict(
    conflict: SynchronizationConflict,
  ): SynchronizationResult<SynchronizationConflict> {
    const validation = this.validator.validateConflict(conflict);
    if (!validation.valid) {
      return createSynchronizationResult({
        success: false,
        errorCode: "invalid_conflict",
        message: validation.errors.join("; "),
      });
    }
    this.stateManager.addConflict(conflict);
    return createSynchronizationResult({ success: true, value: conflict });
  }

  private refreshStatistics(): SynchronizationStatistics {
    const operations = this.queue.snapshot().operations;
    const statistics = createSynchronizationStatistics({
      pendingCount: operations.filter((op) => op.status === "pending").length,
      completedCount: operations.filter((op) => op.status === "completed")
        .length,
      failedCount: operations.filter((op) => op.status === "failed").length,
      cancelledCount: operations.filter((op) => op.status === "cancelled")
        .length,
      conflictCount: this.stateManager.getConflicts().length,
      batchCount: this.batchProcessor.list().length,
      lastCheckpointId:
        this.stateManager.getCheckpoint()?.checkpointId ?? null,
    });
    this.stateManager.setStatistics(statistics);
    return statistics;
  }
}

export function createSynchronizationCoordinator(deps: {
  readonly queue: SynchronizationQueueManager;
  readonly operations: SynchronizationOperations;
  readonly stateManager: SynchronizationStateManager;
  readonly batchProcessor: SynchronizationBatchProcessor;
  readonly validator: SynchronizationValidator;
}): SynchronizationCoordinator {
  return new SynchronizationCoordinator(
    deps.queue,
    deps.operations,
    deps.stateManager,
    deps.batchProcessor,
    deps.validator,
  );
}
