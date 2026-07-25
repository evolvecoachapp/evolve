export * from "./ConsistencyEvaluator";
export * from "./FatigueEvaluator";
export * from "./FrequencyEvaluator";
export * from "./IntensityEvaluator";
export * from "./PlateauEvaluator";
export * from "./ProgressionEvaluator";
export * from "./RecoveryEvaluator";
export * from "./VolumeEvaluator";

import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateFatigue } from "./FatigueEvaluator";
import { evaluateFrequency } from "./FrequencyEvaluator";
import { evaluateIntensity } from "./IntensityEvaluator";
import { evaluatePlateau } from "./PlateauEvaluator";
import { evaluateProgression } from "./ProgressionEvaluator";
import { evaluateRecovery } from "./RecoveryEvaluator";
import { evaluateVolume } from "./VolumeEvaluator";

export interface WorkoutEvaluationBundle {
  readonly volume: ReturnType<typeof evaluateVolume>;
  readonly intensity: ReturnType<typeof evaluateIntensity>;
  readonly frequency: ReturnType<typeof evaluateFrequency>;
  readonly recovery: ReturnType<typeof evaluateRecovery>;
  readonly fatigue: ReturnType<typeof evaluateFatigue>;
  readonly progression: ReturnType<typeof evaluateProgression>;
  readonly plateau: ReturnType<typeof evaluatePlateau>;
  readonly consistency: ReturnType<typeof evaluateConsistency>;
}

export function evaluateWorkoutSignals(signalKeys: readonly string[]): WorkoutEvaluationBundle {
  return Object.freeze({
    volume: evaluateVolume(signalKeys),
    intensity: evaluateIntensity(signalKeys),
    frequency: evaluateFrequency(signalKeys),
    recovery: evaluateRecovery(signalKeys),
    fatigue: evaluateFatigue(signalKeys),
    progression: evaluateProgression(signalKeys),
    plateau: evaluatePlateau(signalKeys),
    consistency: evaluateConsistency(signalKeys),
  });
}
