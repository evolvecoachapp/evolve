/**
 * Deterministic training-load metrics from performance + history.
 */
export interface TrainingLoad {
  /** Session tonnage from the Performance Snapshot. */
  readonly sessionLoad: number;
  readonly volumeLoad: number;
  readonly completedSets: number;
  readonly completedRepetitions: number;
  /** Sum of tonnage across performance history entries in the lookback window. */
  readonly cumulativeTonnage: number;
  /** Mean session tonnage in the lookback window (null when no history samples). */
  readonly averageSessionLoad: number | null;
  /**
   * Session load relative to average (session / average).
   * Null when average is unavailable or zero.
   */
  readonly relativeLoad: number | null;
  /** 0–100 load component used by fatigue aggregation. */
  readonly loadScore: number;
}
