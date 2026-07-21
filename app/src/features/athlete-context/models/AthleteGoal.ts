/** Primary training objective codes — never prose. */
export type AthleteGoalType =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "general_fitness"
  | "fat_loss"
  | "powerlifting"
  | "bodybuilding";

export const ATHLETE_GOAL_TYPES: readonly AthleteGoalType[] = Object.freeze([
  "strength",
  "hypertrophy",
  "endurance",
  "general_fitness",
  "fat_loss",
  "powerlifting",
  "bodybuilding",
]);

/**
 * Structured athlete goal.
 *
 * Consumed by Prompt Builder and Coach Intelligence — never UI copy.
 */
export interface AthleteGoal {
  readonly primary: AthleteGoalType;
  readonly secondary: AthleteGoalType | null;
  /** Optional ISO-8601 target date. */
  readonly targetDate: string | null;
}
