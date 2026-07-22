import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";

/**
 * Immutable view of a progression plan after adaptation evaluation.
 *
 * References the source plan and recommended adaptation ids.
 * Does not mutate workouts, prescriptions, or the progression timeline.
 */
export interface AdaptedProgression {
  readonly sourcePlanRequestId: string;
  readonly readinessScore: number;
  readonly appliedRecommendationIds: readonly string[];
  readonly notes: readonly string[];
  readonly sourcePlan: ProgressionPlan;
}
