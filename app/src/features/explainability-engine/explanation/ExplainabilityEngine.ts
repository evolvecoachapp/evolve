import { buildExplanationDescriptor } from "../builders/DescriptorBuilder";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationInput } from "../models/ExplanationInput";
import type { ExplanationResult } from "../models/ExplanationResult";
import {
  createExplainabilityCoordinator,
  type ExplainabilityCoordinator,
  type ExplainabilityCoordinatorDeps,
} from "./ExplainabilityCoordinator";

export type ExplainabilityEngineDeps = ExplainabilityCoordinatorDeps;

/**
 * Explainability Engine — deterministic explanation orchestration only.
 *
 * CoachingDecision + CoachingRecommendation → CoachingExplanation
 *
 * No AI. No NL. No domain calculations. Never changes decisions.
 */
export class ExplainabilityEngine {
  private readonly coordinator: ExplainabilityCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: ExplainabilityEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:explainability-engine";
    this.coordinator = createExplainabilityCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): ExplanationDescriptor {
    return buildExplanationDescriptor({ id: this.runtimeId, createdAt: this.clock() });
  }

  buildExplanation(input: ExplanationInput): ExplanationResult {
    return this.coordinator.build(input);
  }

  validateExplanation(input: ExplanationInput): ExplanationResult {
    return this.coordinator.validate(input);
  }

  createExplanationSnapshot(input: ExplanationInput): ExplanationResult {
    return this.coordinator.snapshot(input);
  }

  packageExplanation(input: ExplanationInput): ExplanationResult {
    return this.coordinator.package(input);
  }

  describeExplanation(): ExplanationResult {
    return this.coordinator.describe();
  }

  getCoordinator(): ExplainabilityCoordinator {
    return this.coordinator;
  }
}

export function createExplainabilityEngine(
  deps: ExplainabilityEngineDeps = {},
): ExplainabilityEngine {
  return new ExplainabilityEngine(deps);
}
