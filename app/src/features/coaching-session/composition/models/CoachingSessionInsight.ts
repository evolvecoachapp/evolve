/**
 * Immutable insight summary composed from existing Proactive Insights.
 */
export interface CoachingSessionInsight {
  readonly insightIds: readonly string[];
  readonly titles: readonly string[];
  readonly severities: readonly string[];
  readonly summary: string;
  readonly present: boolean;
}
