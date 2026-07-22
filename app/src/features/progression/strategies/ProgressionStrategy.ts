import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionContext } from "../models/ProgressionContext";

/**
 * Independent progression strategy.
 * Receives the current exercise progression and returns an updated immutable progression.
 * Strategies never coordinate with each other.
 */
export interface ProgressionStrategy {
  readonly id: string;
  apply(
    progression: ExerciseProgression,
    context: ProgressionContext,
  ): ExerciseProgression;
}
