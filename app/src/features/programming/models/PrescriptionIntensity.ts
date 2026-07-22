/** How target intensity is represented — never absolute load or 1RM %. */
export type PrescriptionIntensityMetric = "rpe" | "rir" | "none";

export const PRESCRIPTION_INTENSITY_METRICS = Object.freeze([
  "rpe",
  "rir",
  "none",
] as const satisfies readonly PrescriptionIntensityMetric[]);

/**
 * Target intensity representation for a prescribed exercise.
 * No load prediction. No 1RM calculation. No autoregulation.
 */
export interface PrescriptionIntensity {
  readonly metric: PrescriptionIntensityMetric;
  /** Primary numeric target for the chosen metric; null when metric is none. */
  readonly value: number | null;
  readonly targetRpe: number | null;
  readonly targetRir: number | null;
}

export function createEmptyPrescriptionIntensity(): PrescriptionIntensity {
  return Object.freeze({
    metric: "none" as const,
    value: null,
    targetRpe: null,
    targetRir: null,
  });
}
