import {
  createRecommendationEngine,
  type RecommendationEngine,
  type RecommendationEngineDeps,
} from "../recommendation/RecommendationEngine";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationResult } from "../models/RecommendationResult";

export type RecommendationEngineServiceDeps = RecommendationEngineDeps;

/**
 * Recommendation Engine Service — orchestration facade.
 *
 * CoachingDecision → CoachingRecommendation → ExplainabilityInput
 *
 * No networking. No persistence. No provider SDKs. No AI. No domain calculations.
 */
export class RecommendationEngineService {
  private readonly engine: RecommendationEngine;

  constructor(deps: RecommendationEngineServiceDeps = {}) {
    this.engine = createRecommendationEngine(deps);
  }

  buildRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.buildRecommendations(input);
  }

  prioritizeRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.prioritizeRecommendations(input);
  }

  packageRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.packageRecommendations(input);
  }

  describeRecommendations(): RecommendationDescriptor {
    return this.engine.describe();
  }

  validateRecommendations(input: RecommendationInput): RecommendationResult {
    return this.engine.validateRecommendations(input);
  }
}

export function createRecommendationEngineService(
  deps: RecommendationEngineServiceDeps = {},
): RecommendationEngineService {
  return new RecommendationEngineService(deps);
}
