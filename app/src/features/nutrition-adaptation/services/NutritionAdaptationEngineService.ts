import {
  createNutritionAdaptationEngine,
  type NutritionAdaptationEngine,
  type NutritionAdaptationEngineDeps,
} from "../adaptation/NutritionAdaptationEngine";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionResult } from "../models/NutritionResult";

export type NutritionAdaptationEngineServiceDeps = NutritionAdaptationEngineDeps;

/**
 * Nutrition Adaptation Engine Service — orchestration facade.
 *
 * Nutrition Plan + Nutrition Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   → Nutrition Adaptation Engine
 *   → Updated Nutrition Plan → Nutrition Runtime
 */
export class NutritionAdaptationEngineService {
  private readonly engine: NutritionAdaptationEngine;

  constructor(deps: NutritionAdaptationEngineServiceDeps = {}) {
    this.engine = createNutritionAdaptationEngine(deps);
  }

  adaptNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.adaptNutrition(input);
  }

  compareNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.compareNutrition(input);
  }

  describeNutritionAdaptation(): NutritionDescriptor {
    return this.engine.describeNutritionAdaptation();
  }

  createNutritionSnapshot(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.createNutritionSnapshot(input);
  }

  validateNutritionAdaptation(input: NutritionAdaptationInput): NutritionResult {
    return this.engine.validateNutritionAdaptation(input);
  }
}

export function createNutritionAdaptationEngineService(
  deps: NutritionAdaptationEngineServiceDeps = {},
): NutritionAdaptationEngineService {
  return new NutritionAdaptationEngineService(deps);
}
