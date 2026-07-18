/**
 * Lifting tempo expressed in seconds per phase, in
 * eccentric-bottomPause-concentric-topPause order
 * (e.g. 3-1-1-0 is a 3s lowering phase with a 1s pause at the bottom).
 */
export interface Tempo {
  readonly eccentricSeconds: number;
  readonly bottomPauseSeconds: number;
  readonly concentricSeconds: number;
  readonly topPauseSeconds: number;
}
