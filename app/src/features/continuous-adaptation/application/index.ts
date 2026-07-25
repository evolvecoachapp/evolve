import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationResult } from "../models/AdaptationResult";
import {
  createContinuousAdaptationEngineService,
  type ContinuousAdaptationEngineService,
  type ContinuousAdaptationEngineServiceDeps,
} from "../services/ContinuousAdaptationEngineService";

function resolveService(
  service?: ContinuousAdaptationEngineService,
  deps?: ContinuousAdaptationEngineServiceDeps,
): ContinuousAdaptationEngineService {
  return service ?? createContinuousAdaptationEngineService(deps);
}

/** Public API — evaluate adaptation signals into AdaptationDecision package. */
export function evaluateAdaptation(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).evaluateAdaptation(options.input);
}

/** Public API — detect adaptation signal presence only. */
export function detectAdaptation(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).detectAdaptation(options.input);
}

/** Public API — describe Continuous Adaptation Engine capabilities. */
export function describeAdaptation(options: {
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
} = {}): AdaptationDescriptor {
  return resolveService(options.service, options.deps).describeAdaptation();
}

/** Public API — create adaptation snapshot. */
export function createAdaptationSnapshot(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).createAdaptationSnapshot(options.input);
}

/** Public API — validate adaptation package integrity. */
export function validateAdaptation(options: {
  readonly input: AdaptationInput;
  readonly service?: ContinuousAdaptationEngineService;
  readonly deps?: ContinuousAdaptationEngineServiceDeps;
}): AdaptationResult {
  return resolveService(options.service, options.deps).validateAdaptation(options.input);
}

export type { ContinuousAdaptationEngineServiceDeps };
