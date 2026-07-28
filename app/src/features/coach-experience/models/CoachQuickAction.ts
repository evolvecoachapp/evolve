export const CoachQuickActionKinds = {
  EXPLAIN_TODAY_WORKOUT: "explain_today_workout",
  REDUCE_TODAY_VOLUME: "reduce_today_volume",
  ADJUST_CALORIES: "adjust_calories",
  SHOW_WEEKLY_PROGRESS: "show_weekly_progress",
  RECOVERY_ANALYSIS: "recovery_analysis",
  GENERATE_MOTIVATION: "generate_motivation",
  MODIFY_NEXT_WORKOUT: "modify_next_workout",
} as const;

export type CoachQuickActionKind =
  (typeof CoachQuickActionKinds)[keyof typeof CoachQuickActionKinds];

/** Immutable coach quick action — presentation read model. */
export interface CoachQuickAction {
  readonly id: string;
  readonly kind: CoachQuickActionKind;
  readonly label: string;
  readonly prompt: string;
  readonly icon: string;
  readonly enabled: boolean;
  readonly reason: string;
}

export function createCoachQuickAction(input: {
  readonly id: string;
  readonly kind: CoachQuickActionKind;
  readonly label: string;
  readonly prompt: string;
  readonly icon?: string;
  readonly enabled?: boolean;
  readonly reason?: string;
}): CoachQuickAction {
  return Object.freeze({
    id: input.id,
    kind: input.kind,
    label: input.label,
    prompt: input.prompt,
    icon: input.icon ?? "flash-outline",
    enabled: input.enabled ?? true,
    reason: input.reason ?? "",
  });
}
