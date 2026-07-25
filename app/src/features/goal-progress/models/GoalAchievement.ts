import type { GoalMetadata } from "./GoalMetadata";

export const GoalAchievementKinds = {
  PLATEAU: "plateau",
  REGRESSION: "regression",
  PROGRESS: "progress",
  RECOVERY: "recovery",
  CONSISTENCY: "consistency",
  ADHERENCE: "adherence",
  TREND: "trend",
  STATE: "state",
} as const;

export type GoalAchievementKind =
  (typeof GoalAchievementKinds)[keyof typeof GoalAchievementKinds];

export interface GoalAchievement {
  readonly id: string;
  readonly kind: GoalAchievementKind;
  readonly signalKey: string;
  readonly subjectId: string;
  readonly present: boolean;
  readonly metadata: GoalMetadata;
}
