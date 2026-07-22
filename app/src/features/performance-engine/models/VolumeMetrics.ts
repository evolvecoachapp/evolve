/**
 * Single-session volume metrics derived from completed sets.
 */
export interface VolumeMetrics {
  /** Sum of (weight × repetitions) across completed sets with both values. */
  readonly tonnage: number;
  /** Alias of tonnage for load-oriented consumers. */
  readonly volumeLoad: number;
  readonly totalCompletedSets: number;
  readonly totalCompletedRepetitions: number;
  /** Sets that contributed weight×reps to tonnage. */
  readonly loadedSetCount: number;
  /** Sets completed without both weight and repetitions. */
  readonly unloadedSetCount: number;
}
