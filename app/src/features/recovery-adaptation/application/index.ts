import type { RecoveryDescriptor } from "../models/RecoveryDescriptor";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { RecoveryResult } from "../models/RecoveryResult";
import {
  createRecoveryAdaptationEngineService,
  type RecoveryAdaptationEngineService,
  type RecoveryAdaptationEngineServiceDeps,
} from "../services/RecoveryAdaptationEngineService";

function resolveService(
  service?: RecoveryAdaptationEngineService,
  deps?: RecoveryAdaptationEngineServiceDeps,
): RecoveryAdaptationEngineService {
  return service ?? createRecoveryAdaptationEngineService(deps);
}

/** Public API — adapt existing recovery plan from continuous adaptation decisions. */
export function adaptRecovery(options: {
  readonly input: RecoveryAdaptationInput;
  readonly service?: RecoveryAdaptationEngineService;
  readonly deps?: RecoveryAdaptationEngineServiceDeps;
}): RecoveryResult {
  return resolveService(options.service, options.deps).adaptRecovery(options.input);
}

/** Public API — compare plan / snapshot keys. */
export function compareRecovery(options: {
  readonly input: RecoveryAdaptationInput;
  readonly service?: RecoveryAdaptationEngineService;
  readonly deps?: RecoveryAdaptationEngineServiceDeps;
}): RecoveryResult {
  return resolveService(options.service, options.deps).compareRecovery(options.input);
}

/** Public API — describe Recovery Adaptation Engine capabilities. */
export function describeRecoveryAdaptation(options: {
  readonly service?: RecoveryAdaptationEngineService;
  readonly deps?: RecoveryAdaptationEngineServiceDeps;
} = {}): RecoveryDescriptor {
  return resolveService(options.service, options.deps).describeRecoveryAdaptation();
}

/** Public API — create recovery adaptation snapshot. */
export function createRecoverySnapshot(options: {
  readonly input: RecoveryAdaptationInput;
  readonly service?: RecoveryAdaptationEngineService;
  readonly deps?: RecoveryAdaptationEngineServiceDeps;
}): RecoveryResult {
  return resolveService(options.service, options.deps).createRecoverySnapshot(options.input);
}

/** Public API — validate recovery adaptation package. */
export function validateRecoveryAdaptation(options: {
  readonly input: RecoveryAdaptationInput;
  readonly service?: RecoveryAdaptationEngineService;
  readonly deps?: RecoveryAdaptationEngineServiceDeps;
}): RecoveryResult {
  return resolveService(options.service, options.deps).validateRecoveryAdaptation(options.input);
}

export type { RecoveryAdaptationEngineServiceDeps };
