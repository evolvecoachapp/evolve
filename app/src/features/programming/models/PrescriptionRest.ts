/**
 * Rest interval prescription between sets.
 */
export interface PrescriptionRest {
  /** Canonical rest interval in seconds between working sets. */
  readonly seconds: number;
  readonly betweenSetsSeconds: number;
}

export function createEmptyPrescriptionRest(): PrescriptionRest {
  return Object.freeze({
    seconds: 0,
    betweenSetsSeconds: 0,
  });
}
