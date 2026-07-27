import type { CoachInsightDomain } from "./CoachInsight";
import type { CoachInsightSeverity } from "./CoachInsightSeverity";
import type { CoachInsightType } from "./CoachInsightType";

/**
 * Immutable filter for proactive coach insights.
 */
export interface InsightFilter {
  readonly types?: readonly CoachInsightType[] | null;
  readonly severities?: readonly CoachInsightSeverity[] | null;
  readonly domains?: readonly CoachInsightDomain[] | null;
  readonly minConfidence?: number | null;
  readonly since?: string | null;
  readonly until?: string | null;
  readonly searchText?: string | null;
}
