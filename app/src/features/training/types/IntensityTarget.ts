import type { IntensityMetric } from "../enums/IntensityMetric";

/** A single intensity target expressed in a specific metric (e.g. 75% 1RM, RPE 8, RIR 2). */
export interface IntensityTarget {
  readonly metric: IntensityMetric;
  readonly value: number;
}
