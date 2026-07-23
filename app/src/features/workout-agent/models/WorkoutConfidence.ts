/**
 * Immutable confidence score for Workout Agent decisions.
 */
export interface WorkoutConfidence {
  readonly score: number;
  readonly label: WorkoutConfidenceLabel;
  readonly rationale: string | null;
}

export type WorkoutConfidenceLabel =
  | "very_low"
  | "low"
  | "medium"
  | "high"
  | "very_high";

export const WorkoutConfidenceLabels = Object.freeze({
  VERY_LOW: "very_low" as const,
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
  VERY_HIGH: "very_high" as const,
});

export function labelFromScore(score: number): WorkoutConfidenceLabel {
  if (score < 0.2) return WorkoutConfidenceLabels.VERY_LOW;
  if (score < 0.4) return WorkoutConfidenceLabels.LOW;
  if (score < 0.6) return WorkoutConfidenceLabels.MEDIUM;
  if (score < 0.8) return WorkoutConfidenceLabels.HIGH;
  return WorkoutConfidenceLabels.VERY_HIGH;
}
