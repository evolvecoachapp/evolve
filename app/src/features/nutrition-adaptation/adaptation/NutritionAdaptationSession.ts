import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionAdaptationState } from "../models/NutritionAdaptationState";
import { NutritionSessionStatuses } from "../models/NutritionAdaptationState";
import type { NutritionPackage } from "../models/NutritionPackage";
import { freezeState } from "../utils/FreezeNutritionAdaptation";

export class NutritionAdaptationSession {
  private state: NutritionAdaptationState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: NutritionSessionStatuses.IDLE,
      package: null,
      adaptation: null,
      updatedAt,
    });
  }

  getState(): NutritionAdaptationState {
    return this.state;
  }

  getPackage(): NutritionPackage | null {
    return this.state.package;
  }

  getAdaptation(): NutritionAdaptation | null {
    return this.state.adaptation;
  }

  put(
    pkg: NutritionPackage,
    status: (typeof NutritionSessionStatuses)[keyof typeof NutritionSessionStatuses],
  ): void {
    this.state = freezeState({
      status,
      package: pkg,
      adaptation: pkg.adaptation,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createNutritionAdaptationSession(updatedAt: string): NutritionAdaptationSession {
  return new NutritionAdaptationSession(updatedAt);
}
