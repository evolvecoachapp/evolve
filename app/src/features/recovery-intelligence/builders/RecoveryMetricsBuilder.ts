import type { DensityLoad } from "../models/DensityLoad";
import type { FatigueScore } from "../models/FatigueScore";
import type { FrequencyLoad } from "../models/FrequencyLoad";
import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import type { RecoveryStatus } from "../models/RecoveryStatus";
import type { RecoveryWindow } from "../models/RecoveryWindow";
import type { TrainingLoad } from "../models/TrainingLoad";

/**
 * Fluent builder for immutable RecoveryMetrics.
 */
export class RecoveryMetricsBuilder {
  private trainingLoad: TrainingLoad | null = null;
  private fatigue: FatigueScore | null = null;
  private densityLoad: DensityLoad | null = null;
  private frequencyLoad: FrequencyLoad | null = null;
  private recoveryWindow: RecoveryWindow | null = null;
  private status: RecoveryStatus | null = null;

  withTrainingLoad(trainingLoad: TrainingLoad): this {
    this.trainingLoad = trainingLoad;
    return this;
  }

  withFatigue(fatigue: FatigueScore): this {
    this.fatigue = fatigue;
    return this;
  }

  withDensityLoad(densityLoad: DensityLoad): this {
    this.densityLoad = densityLoad;
    return this;
  }

  withFrequencyLoad(frequencyLoad: FrequencyLoad): this {
    this.frequencyLoad = frequencyLoad;
    return this;
  }

  withRecoveryWindow(recoveryWindow: RecoveryWindow): this {
    this.recoveryWindow = recoveryWindow;
    return this;
  }

  withStatus(status: RecoveryStatus): this {
    this.status = status;
    return this;
  }

  build(): RecoveryMetrics {
    if (
      !this.trainingLoad ||
      !this.fatigue ||
      !this.densityLoad ||
      !this.frequencyLoad ||
      !this.recoveryWindow ||
      !this.status
    ) {
      throw new Error("RecoveryMetricsBuilder missing required fields");
    }

    return Object.freeze({
      trainingLoad: Object.freeze({ ...this.trainingLoad }),
      fatigue: Object.freeze({ ...this.fatigue }),
      densityLoad: Object.freeze({ ...this.densityLoad }),
      frequencyLoad: Object.freeze({ ...this.frequencyLoad }),
      recoveryWindow: Object.freeze({ ...this.recoveryWindow }),
      status: Object.freeze({ ...this.status }),
    });
  }
}
