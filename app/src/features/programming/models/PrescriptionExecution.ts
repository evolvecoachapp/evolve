/**
 * Execution notes and cues for how the exercise should be performed.
 * Never contains load, progression, or athlete-history guidance.
 */
export interface PrescriptionExecution {
  readonly notes: readonly string[];
  readonly cues: readonly string[];
}

export function createEmptyPrescriptionExecution(): PrescriptionExecution {
  return Object.freeze({
    notes: Object.freeze([] as string[]),
    cues: Object.freeze([] as string[]),
  });
}
