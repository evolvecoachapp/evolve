import { SynchronizationQueueManager } from "../queue/SynchronizationQueueManager";
import { SynchronizationOperations } from "../operations/SynchronizationOperations";
import { SynchronizationStateManager } from "./SynchronizationStateManager";
import { SynchronizationBatchProcessor } from "./SynchronizationBatchProcessor";
import { SynchronizationValidator } from "./SynchronizationValidator";
import { SynchronizationCoordinator } from "./SynchronizationCoordinator";
import { SynchronizationEngine } from "./SynchronizationEngine";
import type { SynchronizationCapabilities } from "../models/SynchronizationCapabilities";
import { LOCAL_SYNCHRONIZATION_CAPABILITIES } from "../models/SynchronizationCapabilities";

export interface SynchronizationEngineFactoryDeps {
  readonly queue?: SynchronizationQueueManager;
  readonly operations?: SynchronizationOperations;
  readonly stateManager?: SynchronizationStateManager;
  readonly batchProcessor?: SynchronizationBatchProcessor;
  readonly validator?: SynchronizationValidator;
  readonly coordinator?: SynchronizationCoordinator;
  readonly capabilities?: SynchronizationCapabilities;
}

/**
 * Builds a fully wired local SynchronizationEngine.
 */
export const SynchronizationEngineFactory = {
  create(deps: SynchronizationEngineFactoryDeps = {}): SynchronizationEngine {
    const queue = deps.queue ?? new SynchronizationQueueManager();
    const stateManager =
      deps.stateManager ?? new SynchronizationStateManager();
    const operations =
      deps.operations ?? new SynchronizationOperations(queue);
    const batchProcessor =
      deps.batchProcessor ??
      new SynchronizationBatchProcessor(queue, stateManager);
    const validator = deps.validator ?? new SynchronizationValidator();
    const coordinator =
      deps.coordinator ??
      new SynchronizationCoordinator(
        queue,
        operations,
        stateManager,
        batchProcessor,
        validator,
      );

    return new SynchronizationEngine(
      coordinator,
      validator,
      deps.capabilities ?? LOCAL_SYNCHRONIZATION_CAPABILITIES,
    );
  },
} as const;
