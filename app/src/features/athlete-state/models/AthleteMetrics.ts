import type { BodyComposition } from "./BodyComposition";
import type { BodyMeasurements } from "./BodyMeasurements";

/**
 * Immutable metric container (representation only).
 */
export interface AthleteMetrics {
  readonly measurements: BodyMeasurements;
  readonly composition: BodyComposition;
  readonly restingHeartRate: number | null;
  readonly vo2Max: number | null;
  readonly notes: readonly string[];
}
