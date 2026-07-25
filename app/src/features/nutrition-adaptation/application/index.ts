import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionResult } from "../models/NutritionResult";
import {
  createNutritionAdaptationEngineService,
  type NutritionAdaptationEngineService,
  type NutritionAdaptationEngineServiceDeps,
} from "../services/NutritionAdaptationEngineService";

function resolveService(
  service?: NutritionAdaptationEngineService,
  deps?: NutritionAdaptationEngineServiceDeps,
): NutritionAdaptationEngineService {
  return service ?? createNutritionAdaptationEngineService(deps);
}

/** Public API — adapt existing nutrition plan from continuous adaptation decisions. */
export function adaptNutrition(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).adaptNutrition(options.input);
}

/** Public API — compare plan / snapshot keys. */
export function compareNutrition(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).compareNutrition(options.input);
}

/** Public API — describe Nutrition Adaptation Engine capabilities. */
export function describeNutritionAdaptation(options: {
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
} = {}): NutritionDescriptor {
  return resolveService(options.service, options.deps).describeNutritionAdaptation();
}

/** Public API — create nutrition adaptation snapshot. */
export function createNutritionSnapshot(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).createNutritionSnapshot(options.input);
}

/** Public API — validate nutrition adaptation package. */
export function validateNutritionAdaptation(options: {
  readonly input: NutritionAdaptationInput;
  readonly service?: NutritionAdaptationEngineService;
  readonly deps?: NutritionAdaptationEngineServiceDeps;
}): NutritionResult {
  return resolveService(options.service, options.deps).validateNutritionAdaptation(options.input);
}

export type { NutritionAdaptationEngineServiceDeps };
