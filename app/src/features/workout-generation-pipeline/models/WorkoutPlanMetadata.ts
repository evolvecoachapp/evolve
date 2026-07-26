/**
 * Immutable plan-level metadata (distinct from workout-adaptation metadata).
 */
export interface WorkoutPlanMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
  readonly source: "workout_generation_pipeline";
  readonly pipelineVersion: string;
}
