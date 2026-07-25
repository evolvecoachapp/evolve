import {
  createDecisionEngine,
  type DecisionEngine,
  type DecisionEngineDeps,
} from "../decision/DecisionEngine";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";

export type DecisionEngineServiceDeps = DecisionEngineDeps;

/**
 * Decision Engine Service — orchestration facade.
 *
 * UnifiedCoachingContext → CoachingDecision → RecommendationEngineInput
 *
 * No networking. No persistence. No provider SDKs. No AI. No domain calculations.
 */
export class DecisionEngineService {
  private readonly engine: DecisionEngine;

  constructor(deps: DecisionEngineServiceDeps = {}) {
    this.engine = createDecisionEngine(deps);
  }

  buildDecision(input: DecisionInput): DecisionResult {
    return this.engine.buildDecision(input);
  }

  evaluateDecision(input: DecisionInput): DecisionResult {
    return this.engine.evaluateDecision(input);
  }

  resolveDecision(input: DecisionInput): DecisionResult {
    return this.engine.resolveDecision(input);
  }

  describeDecision(): DecisionDescriptor {
    return this.engine.describe();
  }

  validateDecision(input: DecisionInput): DecisionResult {
    return this.engine.validateDecision(input);
  }
}

export function createDecisionEngineService(
  deps: DecisionEngineServiceDeps = {},
): DecisionEngineService {
  return new DecisionEngineService(deps);
}
