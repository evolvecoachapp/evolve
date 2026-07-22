/**
 * Deterministic fatigue score aggregated from load components.
 */
export interface FatigueScore {
  /** Combined 0–100 fatigue score. */
  readonly score: number;
  readonly loadComponent: number;
  readonly densityComponent: number;
  readonly frequencyComponent: number;
}
