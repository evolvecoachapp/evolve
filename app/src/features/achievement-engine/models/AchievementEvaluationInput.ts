import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { PersonalRecordBaselineProvider } from "./PersonalRecordBaseline";

/**
 * Input to Achievement Engine evaluation.
 * DomainEventStream is intentionally not required — reference only at architecture level.
 */
export interface AchievementEvaluationInput {
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly workoutResult: WorkoutResult;
  readonly baselineProvider: PersonalRecordBaselineProvider;
  readonly evaluatedAt?: string;
  readonly evaluationId?: string;
}
