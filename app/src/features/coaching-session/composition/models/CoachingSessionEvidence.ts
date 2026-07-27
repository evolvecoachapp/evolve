/**
 * Immutable evidence citation for an explainable coaching session.
 * References existing domain facts only — never invent evidence.
 */
export type CoachingSessionEvidenceSource =
  | "coach_timeline"
  | "plan_history"
  | "workout_plan"
  | "nutrition_plan"
  | "goal_progress"
  | "recovery_state"
  | "decision_engine"
  | "recommendation_engine"
  | "explainability_engine"
  | "proactive_insights"
  | "conversation_context";

export interface CoachingSessionEvidenceItem {
  readonly id: string;
  readonly source: CoachingSessionEvidenceSource;
  readonly key: string;
  readonly summary: string;
  readonly referenceId: string | null;
}

export interface CoachingSessionEvidence {
  readonly items: readonly CoachingSessionEvidenceItem[];
  readonly sources: readonly CoachingSessionEvidenceSource[];
  readonly timelineEntryIds: readonly string[];
  readonly planVersionNumbers: readonly number[];
  readonly decisionIds: readonly string[];
  readonly recommendationIds: readonly string[];
  readonly explanationIds: readonly string[];
  readonly insightIds: readonly string[];
  readonly keys: readonly string[];
  readonly summary: string;
}
