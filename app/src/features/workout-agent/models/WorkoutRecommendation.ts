import type { WorkoutConfidence } from "./WorkoutConfidence";

/**
 * Immutable recommendation surfaced by the Workout Agent.
 */
export interface WorkoutRecommendation {
  readonly id: string;
  readonly category: WorkoutRecommendationCategory;
  readonly title: string;
  readonly detail: string;
  readonly priority: number;
  readonly confidence: WorkoutConfidence;
  readonly relatedExerciseIds: readonly string[];
}

export type WorkoutRecommendationCategory =
  | "exercise"
  | "volume"
  | "intensity"
  | "progression"
  | "recovery"
  | "split"
  | "general";

export const WorkoutRecommendationCategories = Object.freeze({
  EXERCISE: "exercise" as const,
  VOLUME: "volume" as const,
  INTENSITY: "intensity" as const,
  PROGRESSION: "progression" as const,
  RECOVERY: "recovery" as const,
  SPLIT: "split" as const,
  GENERAL: "general" as const,
});
