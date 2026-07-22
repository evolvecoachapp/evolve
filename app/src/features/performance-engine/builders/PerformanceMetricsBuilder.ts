import type { CompletionMetrics } from "../models/CompletionMetrics";
import type { DensityMetrics } from "../models/DensityMetrics";
import type { IntensityMetrics } from "../models/IntensityMetrics";
import type { PerformanceMetrics } from "../models/PerformanceMetrics";
import type { VolumeMetrics } from "../models/VolumeMetrics";
import { normalizeMetrics } from "../utils/normalizeMetrics";

/**
 * Fluent builder for immutable PerformanceMetrics.
 */
export class PerformanceMetricsBuilder {
  private volume: VolumeMetrics | null = null;
  private intensity: IntensityMetrics | null = null;
  private density: DensityMetrics | null = null;
  private completion: CompletionMetrics | null = null;

  withVolume(volume: VolumeMetrics): this {
    this.volume = volume;
    return this;
  }

  withIntensity(intensity: IntensityMetrics): this {
    this.intensity = intensity;
    return this;
  }

  withDensity(density: DensityMetrics): this {
    this.density = density;
    return this;
  }

  withCompletion(completion: CompletionMetrics): this {
    this.completion = completion;
    return this;
  }

  build(): PerformanceMetrics {
    if (!this.volume || !this.intensity || !this.density || !this.completion) {
      throw new Error("PerformanceMetricsBuilder requires all metric groups");
    }

    return normalizeMetrics(
      Object.freeze({
        volume: Object.freeze({ ...this.volume }),
        intensity: Object.freeze({ ...this.intensity }),
        density: Object.freeze({ ...this.density }),
        completion: Object.freeze({ ...this.completion }),
      }),
    );
  }
}
