/**
 * Immutable evidence citations for a Weekly Coach Report.
 * Projects existing evidence references only — never invent evidence.
 */
export type WeeklyEvidenceSource =
  | "daily_brief"
  | "home_experience"
  | "coach_timeline"
  | "plan_history"
  | "workout_plan"
  | "nutrition_plan"
  | "goal_progress"
  | "recovery_state"
  | "proactive_insights"
  | "coaching_session"
  | "decision_engine"
  | "recommendation_engine";

export interface WeeklyEvidenceItem {
  readonly id: string;
  readonly source: WeeklyEvidenceSource;
  readonly key: string;
  readonly summary: string;
  readonly referenceId: string | null;
}

export interface WeeklyEvidence {
  readonly present: boolean;
  readonly items: readonly WeeklyEvidenceItem[];
  readonly sources: readonly WeeklyEvidenceSource[];
  readonly timelineEntryIds: readonly string[];
  readonly planVersionNumbers: readonly number[];
  readonly decisionIds: readonly string[];
  readonly recommendationIds: readonly string[];
  readonly insightIds: readonly string[];
  readonly dailyBriefId: string | null;
  readonly coachingSessionId: string | null;
  readonly keys: readonly string[];
  readonly summary: string;
}
