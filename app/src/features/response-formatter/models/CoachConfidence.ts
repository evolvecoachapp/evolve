/**
 * Immutable confidence score for a coach response (0–1).
 */
export interface CoachConfidence {
  readonly score: number;
  readonly label: CoachConfidenceLabel;
  readonly source: CoachConfidenceSource;
}

export type CoachConfidenceLabel =
  | "very_low"
  | "low"
  | "medium"
  | "high"
  | "very_high";

export type CoachConfidenceSource =
  | "explicit"
  | "classified"
  | "default";

export const CoachConfidenceLabels = Object.freeze({
  VERY_LOW: "very_low" as const,
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
  VERY_HIGH: "very_high" as const,
});

export const CoachConfidenceSources = Object.freeze({
  EXPLICIT: "explicit" as const,
  CLASSIFIED: "classified" as const,
  DEFAULT: "default" as const,
});

export const DEFAULT_COACH_CONFIDENCE: CoachConfidence = Object.freeze({
  score: 0.5,
  label: CoachConfidenceLabels.MEDIUM,
  source: CoachConfidenceSources.DEFAULT,
});
