/** Kinds of structured coaching insights. */
export type CoachInsightKind =
  | "volume_trend"
  | "frequency_trend"
  | "training_consistency"
  | "recent_pr"
  | "exercise_plateau"
  | "inactivity"
  | "recovery_risk"
  | "fatigue";

/**
 * A single structured coaching insight.
 *
 * Payload is evidence only — never natural language.
 */
export interface CoachInsight {
  readonly id: string;
  readonly kind: CoachInsightKind;
  /** Confidence in `[0, 1]`. */
  readonly confidence: number;
  /** ISO-8601 timestamp when the insight was produced. */
  readonly detectedAt: string;
  /** Numeric / categorical evidence for this insight. */
  readonly payload: Readonly<
    Record<string, number | string | boolean | null>
  >;
}
