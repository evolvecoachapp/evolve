/**
 * Deterministic coach conversation intents (Sprint 24.2 + 24.3).
 * Routed before Supervisor coordination — not a new engine.
 */
export const CoachConversationIntents = {
  WORKOUT_EXPLANATION: "workout_explanation",
  WORKOUT_SUMMARY: "workout_summary",
  EXERCISE_EXPLANATION: "exercise_explanation",
  PROGRESSION_EXPLANATION: "progression_explanation",
  RECOVERY_EXPLANATION: "recovery_explanation",
  RECOMMENDATION_EXPLANATION: "recommendation_explanation",
  WORKOUT_MODIFICATION: "workout_modification",
  GENERAL_COACHING: "general_coaching",
  UNKNOWN: "unknown",
} as const;

export type CoachConversationIntent =
  (typeof CoachConversationIntents)[keyof typeof CoachConversationIntents];

export const ALL_COACH_CONVERSATION_INTENTS: readonly CoachConversationIntent[] =
  Object.freeze(Object.values(CoachConversationIntents));
