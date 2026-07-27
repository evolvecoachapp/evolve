import type { CoachInsightSeverity } from "./CoachInsightSeverity";
import type { CoachInsightType } from "./CoachInsightType";

export const CoachInsightSummaryKinds = {
  TOP: "TOP",
  LATEST: "LATEST",
  CRITICAL: "CRITICAL",
  RECOVERY: "RECOVERY",
  GOAL: "GOAL",
  WORKOUT: "WORKOUT",
  NUTRITION: "NUTRITION",
  ALL: "ALL",
} as const;

export type CoachInsightSummaryKind =
  (typeof CoachInsightSummaryKinds)[keyof typeof CoachInsightSummaryKinds];

/**
 * Deterministic summary of a set of coach insights.
 */
export interface CoachInsightSummary {
  readonly id: string;
  readonly kind: CoachInsightSummaryKind;
  readonly title: string;
  readonly narrative: string;
  readonly insightIds: readonly string[];
  readonly typeCounts: Readonly<Partial<Record<CoachInsightType, number>>>;
  readonly severityCounts: Readonly<
    Partial<Record<CoachInsightSeverity, number>>
  >;
  readonly generatedAt: string;
}
