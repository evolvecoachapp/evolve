import type { WorkoutAssemblyReason } from "./WorkoutAssemblyReason";
import type { WorkoutAssemblyScore } from "./WorkoutAssemblyScore";

/**
 * Machine-readable explanation for an assembly decision.
 */
export interface WorkoutAssemblyExplanation {
  readonly subjectId: string;
  readonly summaryCode: string;
  readonly reasons: readonly WorkoutAssemblyReason[];
  readonly score: WorkoutAssemblyScore;
}
