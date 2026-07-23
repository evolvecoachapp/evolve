/**
 * Training objective for Workout Agent planning.
 */
export const WorkoutObjectives = Object.freeze({
  STRENGTH: "strength" as const,
  HYPERTROPHY: "hypertrophy" as const,
  POWERBUILDING: "powerbuilding" as const,
  POWERLIFTING: "powerlifting" as const,
  GENERAL_FITNESS: "general_fitness" as const,
  RECOVERY: "recovery" as const,
  UNKNOWN: "unknown" as const,
});

export type WorkoutObjective =
  (typeof WorkoutObjectives)[keyof typeof WorkoutObjectives];

export const ALL_WORKOUT_OBJECTIVES: readonly WorkoutObjective[] =
  Object.freeze(Object.values(WorkoutObjectives));
