import type { PrescriptionIntensityMetric } from "../../programming/models/PrescriptionIntensity";

/**
 * Deterministic progression target for one exercise at one week.
 *
 * Evolves prescription parameters over time only.
 * No absolute load. No 1RM. No autoregulation. No athlete adaptation.
 */
export interface ProgressionTarget {
  readonly volumeSets: number;
  readonly volumeRepMin: number;
  readonly volumeRepMax: number;
  readonly intensityMetric: PrescriptionIntensityMetric;
  readonly intensityValue: number | null;
  /** Planned session frequency signal for this exercise (informational). */
  readonly frequencySessionsPerWeek: number;
  /** Deterministic rotation slot index (variation intent only). */
  readonly rotationIndex: number;
}
