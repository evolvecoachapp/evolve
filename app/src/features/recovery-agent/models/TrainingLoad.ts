export type TrainingLoadTolerance = "low" | "moderate" | "high";

/**
 * Training load snapshot for Recovery Agent orchestration (not Recovery Domain).
 */
export interface TrainingLoad {
  readonly score: number;
  readonly tolerance: TrainingLoadTolerance;
  readonly notes: readonly string[];
}
