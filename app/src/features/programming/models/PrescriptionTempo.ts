/**
 * Optional eccentric / pause / concentric tempo prescription in seconds.
 */
export interface PrescriptionTempo {
  readonly eccentricSeconds: number;
  readonly bottomPauseSeconds: number;
  readonly concentricSeconds: number;
  readonly topPauseSeconds: number;
}

export function createDefaultPrescriptionTempo(): PrescriptionTempo {
  return Object.freeze({
    eccentricSeconds: 2,
    bottomPauseSeconds: 0,
    concentricSeconds: 1,
    topPauseSeconds: 0,
  });
}
