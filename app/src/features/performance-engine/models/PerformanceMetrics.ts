import type { CompletionMetrics } from "./CompletionMetrics";
import type { DensityMetrics } from "./DensityMetrics";
import type { IntensityMetrics } from "./IntensityMetrics";
import type { VolumeMetrics } from "./VolumeMetrics";

/**
 * Aggregated single-session performance metrics.
 */
export interface PerformanceMetrics {
  readonly volume: VolumeMetrics;
  readonly intensity: IntensityMetrics;
  readonly density: DensityMetrics;
  readonly completion: CompletionMetrics;
}
