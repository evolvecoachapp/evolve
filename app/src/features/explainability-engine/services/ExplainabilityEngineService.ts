import {
  createExplainabilityEngine,
  type ExplainabilityEngine,
  type ExplainabilityEngineDeps,
} from "../explanation/ExplainabilityEngine";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationResult } from "../models/ExplanationResult";

export type ExplainabilityEngineServiceDeps = ExplainabilityEngineDeps;

/**
 * Explainability Engine Service — orchestration facade.
 *
 * CoachingDecision + CoachingRecommendation → CoachingExplanation → LLMFormatterInput
 */
export class ExplainabilityEngineService {
  private readonly engine: ExplainabilityEngine;

  constructor(deps: ExplainabilityEngineServiceDeps = {}) {
    this.engine = createExplainabilityEngine(deps);
  }

  buildExplanation(input: ExplanationInput): ExplanationResult {
    return this.engine.buildExplanation(input);
  }

  validateExplanation(input: ExplanationInput): ExplanationResult {
    return this.engine.validateExplanation(input);
  }

  createExplanationSnapshot(input: ExplanationInput): ExplanationResult {
    return this.engine.createExplanationSnapshot(input);
  }

  packageExplanation(input: ExplanationInput): ExplanationResult {
    return this.engine.packageExplanation(input);
  }

  describeExplanation(): ExplanationDescriptor {
    return this.engine.describe();
  }
}

export function createExplainabilityEngineService(
  deps: ExplainabilityEngineServiceDeps = {},
): ExplainabilityEngineService {
  return new ExplainabilityEngineService(deps);
}
