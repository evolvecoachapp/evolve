import {
  createContinuousAdaptationEngine,
  type ContinuousAdaptationEngine,
  type ContinuousAdaptationEngineDeps,
} from "../adaptation/ContinuousAdaptationEngine";
import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationResult } from "../models/AdaptationResult";

export type ContinuousAdaptationEngineServiceDeps = ContinuousAdaptationEngineDeps;

/**
 * Continuous Adaptation Engine Service — orchestration facade.
 *
 * Athlete State + Context Fusion + Decision + Recommendation + Explainability
 *   → Continuous Adaptation Engine
 *   → AdaptationDecision
 *   → Workout/Nutrition/Recovery/GoalProgress handoff inputs
 */
export class ContinuousAdaptationEngineService {
  private readonly engine: ContinuousAdaptationEngine;

  constructor(deps: ContinuousAdaptationEngineServiceDeps = {}) {
    this.engine = createContinuousAdaptationEngine(deps);
  }

  evaluateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.engine.evaluateAdaptation(input);
  }

  detectAdaptation(input: AdaptationInput): AdaptationResult {
    return this.engine.detectAdaptation(input);
  }

  describeAdaptation(): AdaptationDescriptor {
    return this.engine.describeAdaptation();
  }

  createAdaptationSnapshot(input: AdaptationInput): AdaptationResult {
    return this.engine.createAdaptationSnapshot(input);
  }

  validateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.engine.validateAdaptation(input);
  }
}

export function createContinuousAdaptationEngineService(
  deps: ContinuousAdaptationEngineServiceDeps = {},
): ContinuousAdaptationEngineService {
  return new ContinuousAdaptationEngineService(deps);
}
