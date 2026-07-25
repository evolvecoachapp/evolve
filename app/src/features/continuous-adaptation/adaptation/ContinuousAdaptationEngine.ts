import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import type { AdaptationInput } from "../models/AdaptationInput";
import type { AdaptationResult } from "../models/AdaptationResult";
import { buildAdaptationDescriptor } from "../builders/DescriptorBuilder";
import {
  createAdaptationCoordinator,
  type AdaptationCoordinator,
  type AdaptationCoordinatorDeps,
} from "./AdaptationCoordinator";

export type ContinuousAdaptationEngineDeps = AdaptationCoordinatorDeps;

/**
 * Continuous Adaptation Engine — adaptation detection only.
 * Does NOT modify workout/nutrition/recovery plans.
 */
export class ContinuousAdaptationEngine {
  private readonly coordinator: AdaptationCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: ContinuousAdaptationEngineDeps = {}) {
    this.coordinator = createAdaptationCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:continuous-adaptation";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  evaluateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.coordinator.evaluate(input);
  }

  detectAdaptation(input: AdaptationInput): AdaptationResult {
    return this.coordinator.detect(input);
  }

  describeAdaptation(): AdaptationDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildAdaptationDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createAdaptationSnapshot(input: AdaptationInput): AdaptationResult {
    return this.coordinator.snapshot(input);
  }

  validateAdaptation(input: AdaptationInput): AdaptationResult {
    return this.coordinator.validate(input);
  }
}

export function createContinuousAdaptationEngine(
  deps: ContinuousAdaptationEngineDeps = {},
): ContinuousAdaptationEngine {
  return new ContinuousAdaptationEngine(deps);
}
