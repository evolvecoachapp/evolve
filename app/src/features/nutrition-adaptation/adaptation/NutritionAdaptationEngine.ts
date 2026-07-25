import { buildNutritionDescriptor } from "../builders/DescriptorBuilder";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionResult } from "../models/NutritionResult";
import {
  createNutritionAdaptationCoordinator,
  type NutritionAdaptationCoordinator,
  type NutritionAdaptationCoordinatorDeps,
} from "./NutritionAdaptationCoordinator";

export type NutritionAdaptationEngineDeps = NutritionAdaptationCoordinatorDeps;

/**
 * Nutrition Adaptation Engine — adapts existing nutrition plans only.
 * Does NOT generate nutrition from scratch. No AI. No networking. No persistence.
 */
export class NutritionAdaptationEngine {
  private readonly coordinator: NutritionAdaptationCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: NutritionAdaptationEngineDeps = {}) {
    this.coordinator = createNutritionAdaptationCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:nutrition-adaptation";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  adaptNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.adapt(input);
  }

  compareNutrition(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.compare(input);
  }

  describeNutritionAdaptation(): NutritionDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildNutritionDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createNutritionSnapshot(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.snapshot(input);
  }

  validateNutritionAdaptation(input: NutritionAdaptationInput): NutritionResult {
    return this.coordinator.validate(input);
  }
}

export function createNutritionAdaptationEngine(
  deps: NutritionAdaptationEngineDeps = {},
): NutritionAdaptationEngine {
  return new NutritionAdaptationEngine(deps);
}
