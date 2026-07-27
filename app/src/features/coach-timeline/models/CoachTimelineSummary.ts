import type { CoachTimelineEventCategory } from "./CoachTimelineEvent";

export const CoachTimelineSummaryKinds = {
  LAST_7_DAYS: "last_7_days",
  CURRENT_TRAINING_BLOCK: "current_training_block",
  CURRENT_CUT: "current_cut",
  CURRENT_BULK: "current_bulk",
  RECENT_RECOVERY_DECISIONS: "recent_recovery_decisions",
  RECENT_WORKOUT_MODIFICATIONS: "recent_workout_modifications",
  LATEST_COACH_DECISIONS: "latest_coach_decisions",
} as const;

export type CoachTimelineSummaryKind =
  (typeof CoachTimelineSummaryKinds)[keyof typeof CoachTimelineSummaryKinds];

/**
 * Deterministic summary of a filtered timeline slice.
 */
export interface CoachTimelineSummary {
  readonly kind: CoachTimelineSummaryKind;
  readonly title: string;
  readonly narrative: string;
  readonly entryIds: readonly string[];
  readonly entryCount: number;
  readonly categories: readonly CoachTimelineEventCategory[];
  readonly fromTimestamp: string | null;
  readonly toTimestamp: string | null;
  readonly generatedAt: string;
}
