import type { SynchronizationAdapter } from "../../../core/infrastructure/adapters/SynchronizationAdapter";
import {
  createAdapterResult,
  type AdapterResult,
} from "../../../core/infrastructure/registry/AdapterResult";
import type { SynchronizationCapabilities } from "../models/SynchronizationCapabilities";
import { LOCAL_SYNCHRONIZATION_CAPABILITIES } from "../models/SynchronizationCapabilities";
import type { SynchronizationProviderToken } from "../registry/SynchronizationProviderToken";
import type { SynchronizationCoordinator } from "./SynchronizationCoordinator";
import type { SynchronizationValidator } from "./SynchronizationValidator";
import {
  createSynchronizationResult,
  createSynchronizationValidation,
  type SynchronizationResult,
  type SynchronizationValidation,
} from "../models/SynchronizationResult";
import type { SynchronizationQueue } from "../models/SynchronizationQueue";
import type { SynchronizationState } from "../models/SynchronizationState";
import type { SynchronizationStatistics } from "../models/SynchronizationStatistics";
import type { SynchronizationOperation } from "../models/SynchronizationOperation";
import type { SynchronizationOperationType } from "../models/SynchronizationOperation";
import type { SynchronizationBatch } from "../models/SynchronizationBatch";
import type { SynchronizationPolicy } from "../models/SynchronizationPolicy";
import type { SynchronizationConflict } from "../models/SynchronizationConflict";
import type { SynchronizationCheckpoint } from "../models/SynchronizationCheckpoint";

/**
 * Deterministic synchronization engine.
 * Implements SynchronizationAdapter via local orchestration only.
 * No networking. No HTTP. No remote execution.
 */
export class SynchronizationEngine implements SynchronizationAdapter {
  readonly adapterId = "synchronization" as const;
  readonly providerId: SynchronizationProviderToken = "local";
  readonly capabilities: SynchronizationCapabilities;

  constructor(
    private readonly coordinator: SynchronizationCoordinator,
    private readonly validator: SynchronizationValidator,
    capabilities: SynchronizationCapabilities = LOCAL_SYNCHRONIZATION_CAPABILITIES,
  ) {
    this.capabilities = capabilities;
  }

  /**
   * Local orchestration: enqueue a push operation. No remote push.
   */
  push(
    payload: Readonly<Record<string, string>>,
  ): AdapterResult<void> {
    const result = this.coordinator.enqueue({
      type: "push",
      payload,
    });
    if (!result.success) {
      return createAdapterResult({
        success: false,
        errorCode: result.errorCode,
        message: result.message,
      });
    }
    return createAdapterResult({ success: true, value: null });
  }

  /**
   * Local orchestration: enqueue a pull operation. No remote pull.
   */
  pull(): AdapterResult<Readonly<Record<string, string>>> {
    const result = this.coordinator.enqueue({
      type: "pull",
      payload: {},
    });
    if (!result.success) {
      return createAdapterResult<Readonly<Record<string, string>>>({
        success: false,
        value: null,
        errorCode: result.errorCode,
        message: result.message,
      });
    }
    return createAdapterResult({
      success: true,
      value: Object.freeze({}),
    });
  }

  getStatus(): AdapterResult<string> {
    return createAdapterResult({
      success: true,
      value: this.coordinator.getState(),
    });
  }

  getQueue(): SynchronizationResult<SynchronizationQueue> {
    const queue = this.coordinator.getQueue();
    const validation = this.validator.validateQueue(queue);
    if (!validation.valid) {
      return createSynchronizationResult({
        success: false,
        errorCode: "invalid_queue",
        message: validation.errors.join("; "),
      });
    }
    return createSynchronizationResult({ success: true, value: queue });
  }

  getState(): SynchronizationResult<SynchronizationState> {
    return createSynchronizationResult({
      success: true,
      value: this.coordinator.getState(),
    });
  }

  getStatistics(): SynchronizationResult<SynchronizationStatistics> {
    return createSynchronizationResult({
      success: true,
      value: this.coordinator.getStatistics(),
    });
  }

  getPolicy(): SynchronizationResult<SynchronizationPolicy> {
    return createSynchronizationResult({
      success: true,
      value: this.coordinator.getPolicy(),
    });
  }

  getConflicts(): SynchronizationResult<readonly SynchronizationConflict[]> {
    return createSynchronizationResult({
      success: true,
      value: this.coordinator.getConflicts(),
    });
  }

  getCheckpoint(): SynchronizationResult<SynchronizationCheckpoint | null> {
    return createSynchronizationResult({
      success: true,
      value: this.coordinator.getCheckpoint(),
    });
  }

  enqueue(input: {
    readonly type: SynchronizationOperationType;
    readonly payload?: Readonly<Record<string, string>>;
    readonly metadata?: Readonly<Record<string, string>>;
    readonly operationId?: string;
  }): SynchronizationResult<SynchronizationOperation> {
    return this.coordinator.enqueue(input);
  }

  dequeue(): SynchronizationResult<SynchronizationOperation | null> {
    return this.coordinator.dequeue();
  }

  peek(): SynchronizationResult<SynchronizationOperation | null> {
    return this.coordinator.peek();
  }

  markCompleted(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.coordinator.markCompleted(operationId);
  }

  markFailed(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.coordinator.markFailed(operationId);
  }

  cancel(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.coordinator.cancel(operationId);
  }

  clear(): SynchronizationResult<void> {
    return this.coordinator.clear();
  }

  retry(
    operationId: string,
  ): SynchronizationResult<SynchronizationOperation> {
    return this.coordinator.retry(operationId);
  }

  createBatch(
    operationIds?: readonly string[],
  ): SynchronizationResult<SynchronizationBatch> {
    return this.coordinator.createBatch(operationIds);
  }

  completeBatch(batchId: string): SynchronizationResult<SynchronizationBatch> {
    return this.coordinator.completeBatch(batchId);
  }

  transition(
    to: SynchronizationState,
  ): SynchronizationResult<SynchronizationState> {
    return this.coordinator.transition(to);
  }

  setPolicy(
    policy: SynchronizationPolicy,
  ): SynchronizationResult<SynchronizationPolicy> {
    return this.coordinator.setPolicy(policy);
  }

  recordConflict(
    conflict: SynchronizationConflict,
  ): SynchronizationResult<SynchronizationConflict> {
    return this.coordinator.recordConflict(conflict);
  }

  validate(): SynchronizationValidation {
    const errors: string[] = [];
    const queueValidation = this.validator.validateQueue(
      this.coordinator.getQueue(),
    );
    errors.push(...queueValidation.errors);
    const stateValidation = this.validator.validateState(
      this.coordinator.getState(),
    );
    errors.push(...stateValidation.errors);
    const policyValidation = this.validator.validatePolicy(
      this.coordinator.getPolicy(),
    );
    errors.push(...policyValidation.errors);
    return createSynchronizationValidation(errors);
  }
}
