/**
 * Intended audience for a coaching context.
 * Metadata only — does not generate messages.
 */
export const CoachAudiences = {
  ATHLETE: "athlete",
  SYSTEM: "system",
  REVIEW: "review",
} as const;

export type CoachAudience = (typeof CoachAudiences)[keyof typeof CoachAudiences];

export const ALL_COACH_AUDIENCES: readonly CoachAudience[] = Object.freeze([
  CoachAudiences.ATHLETE,
  CoachAudiences.SYSTEM,
  CoachAudiences.REVIEW,
]);
