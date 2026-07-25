import { buildRecommendationDescriptor } from "../builders/RecommendationDescriptorBuilder";
import type { RecommendationDescriptor } from "../models/RecommendationDescriptor";
import type { RecommendationInput } from "../models/RecommendationInput";
import type { RecommendationResult } from "../models/RecommendationResult";
import {
  createRecommendationCoordinator,
  type RecommendationCoordinator,
  type RecommendationCoordinatorDeps,
} from "./RecommendationCoordinator";

export type RecommendationEngineDeps = RecommendationCoordinatorDeps;

/**
 * Recommendation Engine — deterministic recommendation orchestration only.
 *
 * CoachingDecision → CoachingRecommendation / RecommendationPackage
 *
 * No AI. No NL. No domain calculations. No action execution.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No networking. No persistence.
 */
export class RecommendationEngine {
  private readonly coordinator: RecommendationCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: RecommendationEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:recommendation-engine";
    this.coordinator = createRecommendationCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): RecommendationDescriptor {
    return buildRecommendationDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.build(input);
  }

  prioritizeRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.prioritize(input);
  }

  packageRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.package(input);
  }

  validateRecommendations(input: RecommendationInput): RecommendationResult {
    return this.coordinator.validate(input);
  }

  describeRecommendations(): RecommendationResult {
    return this.coordinator.describe();
  }

  getCoordinator(): RecommendationCoordinator {
    return this.coordinator;
  }
}

export function createRecommendationEngine(
  deps: RecommendationEngineDeps = {},
): RecommendationEngine {
  return new RecommendationEngine(deps);
}
