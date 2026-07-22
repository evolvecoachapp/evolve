/**
 * Volume prescription for one exercise — sets and rep range only.
 * No weekly volume planning. No deload. No progression.
 */
export interface PrescriptionVolume {
  readonly sets: number;
  readonly repMin: number;
  readonly repMax: number;
  readonly totalRepsMin: number;
  readonly totalRepsMax: number;
}

export function createEmptyPrescriptionVolume(): PrescriptionVolume {
  return Object.freeze({
    sets: 0,
    repMin: 0,
    repMax: 0,
    totalRepsMin: 0,
    totalRepsMax: 0,
  });
}
