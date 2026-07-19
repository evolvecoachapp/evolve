import type { ExerciseCategory } from "../../enums/ExerciseCategory";
import type { ProgressionScheme } from "../../models/ProgressionScheme";
import type { ExerciseId } from "../../types/ids";
import type { PlanningContext } from "../context/PlanningContext";

/**
 * Inputs a `ProgressionPlanner` needs to choose how load, volume, or
 * intensity should evolve for a single exercise over the life of a
 * program. Consumes the shared `PlanningContext` (goal, experience, and
 * the program's `durationWeeks`, among others) instead of redeclaring
 * those fields, so the same contract can yield, for example, linear
 * progression for a novice bodybuilder or block/undulating progression for
 * an advanced powerlifter.
 */
export interface ProgressionPlanningInput {
  readonly planningContext: PlanningContext;
  readonly exerciseId: ExerciseId;
  readonly exerciseCategory: ExerciseCategory;
}

/** Outcome of a progression planning pass for a single exercise. */
export interface ProgressionPlanningResult {
  readonly exerciseId: ExerciseId;
  readonly progressionScheme: ProgressionScheme;
}

/**
 * Decides the `ProgressionScheme` that should govern a single exercise.
 * Contract only: implementations decide which progression model fits a
 * given goal and experience level; this interface only fixes the shape of
 * the inputs and outputs.
 */
export interface ProgressionPlanner {
  planProgression(input: ProgressionPlanningInput): ProgressionPlanningResult;
}
