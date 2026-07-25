import {
  createRecoveryAdaptationEngine,
  type RecoveryAdaptationEngine,
  type RecoveryAdaptationEngineDeps,
} from "../adaptation/RecoveryAdaptationEngine";
import type { RecoveryDescriptor } from "../models/RecoveryDescriptor";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { RecoveryResult } from "../models/RecoveryResult";

export type RecoveryAdaptationEngineServiceDeps = RecoveryAdaptationEngineDeps;

/**
 * Recovery Adaptation Engine Service — orchestration facade.
 *
 * Recovery Plan + Recovery Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   → Recovery Adaptation Engine
 *   → Updated Recovery Plan → Recovery Runtime
 */
export class RecoveryAdaptationEngineService {
  private readonly engine: RecoveryAdaptationEngine;

  constructor(deps: RecoveryAdaptationEngineServiceDeps = {}) {
    this.engine = createRecoveryAdaptationEngine(deps);
  }

  adaptRecovery(input: RecoveryAdaptationInput): RecoveryResult {
    return this.engine.adaptRecovery(input);
  }

  compareRecovery(input: RecoveryAdaptationInput): RecoveryResult {
    return this.engine.compareRecovery(input);
  }

  describeRecoveryAdaptation(): RecoveryDescriptor {
    return this.engine.describeRecoveryAdaptation();
  }

  createRecoverySnapshot(input: RecoveryAdaptationInput): RecoveryResult {
    return this.engine.createRecoverySnapshot(input);
  }

  validateRecoveryAdaptation(input: RecoveryAdaptationInput): RecoveryResult {
    return this.engine.validateRecoveryAdaptation(input);
  }
}

export function createRecoveryAdaptationEngineService(
  deps: RecoveryAdaptationEngineServiceDeps = {},
): RecoveryAdaptationEngineService {
  return new RecoveryAdaptationEngineService(deps);
}
