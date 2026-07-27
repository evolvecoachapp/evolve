/**
 * Deterministic Home quick action — no LLM.
 * Generated only from available composed domain presence.
 */
export const HomeQuickActionKinds = {
  RESUME_WORKOUT: "resume_workout",
  CONTINUE_NUTRITION: "continue_nutrition",
  REVIEW_GOAL: "review_goal",
  SEE_TIMELINE: "see_timeline",
  VIEW_INSIGHTS: "view_insights",
  RESTORE_PREVIOUS_PLAN: "restore_previous_plan",
} as const;

export type HomeQuickActionKind =
  (typeof HomeQuickActionKinds)[keyof typeof HomeQuickActionKinds];

export interface HomeQuickAction {
  readonly id: string;
  readonly kind: HomeQuickActionKind;
  readonly label: string;
  readonly enabled: boolean;
  readonly reason: string;
}
