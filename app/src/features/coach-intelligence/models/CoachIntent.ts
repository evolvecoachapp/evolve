/**
 * Deterministic coaching intent codes.
 * Structured context for future prompt builders — not conversational text.
 */
export const CoachIntents = {
  INFORM: "inform",
  REINFORCE: "reinforce",
  CAUTION: "caution",
  CELEBRATE: "celebrate",
  PREPARE: "prepare",
  FOCUS: "focus",
} as const;

export type CoachIntent = (typeof CoachIntents)[keyof typeof CoachIntents];

export const ALL_COACH_INTENTS: readonly CoachIntent[] = Object.freeze([
  CoachIntents.INFORM,
  CoachIntents.REINFORCE,
  CoachIntents.CAUTION,
  CoachIntents.CELEBRATE,
  CoachIntents.PREPARE,
  CoachIntents.FOCUS,
]);
