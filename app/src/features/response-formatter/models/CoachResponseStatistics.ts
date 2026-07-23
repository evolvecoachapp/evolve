/**
 * Immutable aggregate statistics for a formatted coach response.
 */
export interface CoachResponseStatistics {
  readonly characterCount: number;
  readonly wordCount: number;
  readonly sectionCount: number;
  readonly recommendationCount: number;
  readonly warningCount: number;
  readonly actionCount: number;
  readonly exerciseCount: number;
  readonly nutritionCount: number;
  readonly recoveryCount: number;
  readonly questionCount: number;
  readonly citationCount: number;
  readonly insightCount: number;
}
