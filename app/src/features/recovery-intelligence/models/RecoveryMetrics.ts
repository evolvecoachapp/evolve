import type { DensityLoad } from "./DensityLoad";
import type { FatigueScore } from "./FatigueScore";
import type { FrequencyLoad } from "./FrequencyLoad";
import type { RecoveryStatus } from "./RecoveryStatus";
import type { RecoveryWindow } from "./RecoveryWindow";
import type { TrainingLoad } from "./TrainingLoad";

/**
 * Aggregated deterministic recovery metrics.
 */
export interface RecoveryMetrics {
  readonly trainingLoad: TrainingLoad;
  readonly fatigue: FatigueScore;
  readonly densityLoad: DensityLoad;
  readonly frequencyLoad: FrequencyLoad;
  readonly recoveryWindow: RecoveryWindow;
  readonly status: RecoveryStatus;
}
