/**
 * High-level workout conversation / planning intent.
 */
export const WorkoutIntents = Object.freeze({
  PLAN_WORKOUT: "plan_workout" as const,
  ADJUST_PROGRESSION: "adjust_progression" as const,
  SELECT_EXERCISES: "select_exercises" as const,
  DESIGN_SPLIT: "design_split" as const,
  EVALUATE_PLAN: "evaluate_plan" as const,
  RECOVERY_ADVICE: "recovery_advice" as const,
  GENERAL_TRAINING: "general_training" as const,
});

export type WorkoutIntent =
  (typeof WorkoutIntents)[keyof typeof WorkoutIntents];

export const ALL_WORKOUT_INTENTS: readonly WorkoutIntent[] = Object.freeze(
  Object.values(WorkoutIntents),
);
