/**
 * One prescribed working set within an ExercisePrescription.
 * No load calculation. No progression. No athlete history.
 */
export interface PrescriptionSet {
  /** 1-based set index within the prescription. */
  readonly setIndex: number;
  readonly repMin: number;
  readonly repMax: number;
  /** Target RPE when intensity metric uses RPE; otherwise null. */
  readonly targetRpe: number | null;
  /** Target RIR when intensity metric uses RIR; otherwise null. */
  readonly targetRir: number | null;
}
