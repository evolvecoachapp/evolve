export const QuickActionKinds = {
  START_WORKOUT: "start_workout",
  LOG_NUTRITION: "log_nutrition",
  VIEW_RECOVERY: "view_recovery",
  VIEW_GOALS: "view_goals",
  ASK_COACH: "ask_coach",
  VIEW_PROGRESS: "view_progress",
  VIEW_PROFILE: "view_profile",
} as const;

export type QuickActionKind =
  (typeof QuickActionKinds)[keyof typeof QuickActionKinds];

/** Immutable quick action for Home — destinations are navigation placeholders. */
export interface QuickAction {
  readonly id: string;
  readonly kind: QuickActionKind;
  readonly label: string;
  readonly icon: string;
  readonly destination: string;
  readonly enabled: boolean;
  readonly reason: string;
}
