/**
 * High-level coaching intents used for specialist agent selection.
 * No domain / business logic — routing hints only.
 */
export const CoachIntents = Object.freeze({
  HOLISTIC: "holistic" as const,
  WORKOUT_FOCUS: "workout_focus" as const,
  RECOVERY_FOCUS: "recovery_focus" as const,
  NUTRITION_FOCUS: "nutrition_focus" as const,
  MULTI_DOMAIN: "multi_domain" as const,
  EDUCATION: "education" as const,
  UNKNOWN: "unknown" as const,
});

export type CoachIntent = (typeof CoachIntents)[keyof typeof CoachIntents];

export const ALL_COACH_INTENTS: readonly CoachIntent[] = Object.freeze(
  Object.values(CoachIntents),
);
