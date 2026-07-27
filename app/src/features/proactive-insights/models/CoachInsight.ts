import type { CoachInsightEvidence } from "./CoachInsightEvidence";
import type { CoachInsightReason } from "./CoachInsightReason";
import type { CoachInsightRecommendation } from "./CoachInsightRecommendation";
import type { CoachInsightSeverity } from "./CoachInsightSeverity";
import type { CoachInsightType } from "./CoachInsightType";

export type CoachInsightDomain =
  | "workout"
  | "nutrition"
  | "recovery"
  | "goal"
  | "decision"
  | "program"
  | "system"
  | "unknown";

/**
 * Immutable proactive coach insight.
 * Generated only from deterministic evidence — never mutate after creation.
 */
export interface CoachInsight {
  readonly id: string;
  readonly athleteId: string;
  readonly timestamp: string;
  readonly type: CoachInsightType;
  readonly severity: CoachInsightSeverity;
  readonly evidence: CoachInsightEvidence;
  readonly reason: CoachInsightReason;
  readonly recommendation: CoachInsightRecommendation;
  readonly confidence: number;
  readonly relatedTimelineEntryIds: readonly string[];
  readonly affectedDomain: CoachInsightDomain;
  readonly expectedOutcome: string;
  readonly title: string;
  readonly summary: string;
  readonly metadata: Readonly<Record<string, string>>;
}
