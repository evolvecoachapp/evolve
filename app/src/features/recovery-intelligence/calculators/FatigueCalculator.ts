import type { DensityLoad } from "../models/DensityLoad";
import type { FatigueScore } from "../models/FatigueScore";
import type { FrequencyLoad } from "../models/FrequencyLoad";
import type { TrainingLoad } from "../models/TrainingLoad";
import { clamp, roundTo } from "../utils/normalizeValues";

/**
 * Pure fatigue calculator combining load / density / frequency components.
 * One responsibility: components → fatigue score.
 *
 * Weights: load 50%, density 25%, frequency 25%.
 */
export class FatigueCalculator {
  calculate(input: {
    readonly trainingLoad: TrainingLoad;
    readonly densityLoad: DensityLoad;
    readonly frequencyLoad: FrequencyLoad;
  }): FatigueScore {
    const loadComponent = clamp(input.trainingLoad.loadScore, 0, 100);
    const densityComponent = clamp(input.densityLoad.densityScore, 0, 100);
    const frequencyComponent = clamp(
      input.frequencyLoad.frequencyScore,
      0,
      100,
    );

    const score = clamp(
      roundTo(
        loadComponent * 0.5 +
          densityComponent * 0.25 +
          frequencyComponent * 0.25,
        4,
      ),
      0,
      100,
    );

    return Object.freeze({
      score,
      loadComponent,
      densityComponent,
      frequencyComponent,
    });
  }
}

export function createFatigueCalculator(): FatigueCalculator {
  return new FatigueCalculator();
}
