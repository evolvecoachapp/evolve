/**
 * Strategic session goal codes — what the session should achieve.
 *
 * Never maps to exercises, sets, reps, RPE, or percentages.
 */
export type SessionGoalCode =
  | "primary_lift_emphasis"
  | "volume_accumulation"
  | "technique_practice"
  | "conditioning"
  | "recovery_stimulus"
  | "balanced_development"
  | "rest";

export const SESSION_GOAL_CODES = Object.freeze([
  "primary_lift_emphasis",
  "volume_accumulation",
  "technique_practice",
  "conditioning",
  "recovery_stimulus",
  "balanced_development",
  "rest",
] as const satisfies readonly SessionGoalCode[]);
