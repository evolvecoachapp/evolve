import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import type { CoachInsightDomain } from "../models/CoachInsight";
import type { CoachInsightType } from "../models/CoachInsightType";
import { CoachInsightTypes } from "../models/CoachInsightType";

/**
 * Intermediate deterministic pattern signal produced by analyzers.
 * Not a final CoachInsight — buildCoachInsights materializes insights.
 */
export interface InsightPatternSignal {
  readonly type: CoachInsightType;
  readonly domain: CoachInsightDomain;
  readonly title: string;
  readonly summary: string;
  readonly reason: string;
  readonly impact: string;
  readonly recommendationAction: string;
  readonly recommendationRationale: string;
  readonly expectedOutcome: string;
  readonly evidenceKeys: readonly string[];
  readonly timelineEntryIds: readonly string[];
  readonly signalCount: number;
  readonly decisionId: string | null;
  readonly recommendationId: string | null;
  readonly explanationId: string | null;
}

export function textBlob(entry: CoachTimelineEntry): string {
  return [
    entry.summary,
    entry.explanation,
    entry.decisionReason.reason,
    entry.decisionReason.impact,
    entry.decisionReason.expectedOutcome,
    Object.values(entry.metadata).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export function matchesAny(
  text: string,
  patterns: readonly RegExp[],
): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function entriesByCategory(
  entries: readonly CoachTimelineEntry[],
  categories: readonly string[],
): readonly CoachTimelineEntry[] {
  const set = new Set(categories);
  return Object.freeze(
    entries.filter((entry) => set.has(entry.event.category)),
  );
}

export function collectIds(
  entries: readonly CoachTimelineEntry[],
): readonly string[] {
  return Object.freeze(entries.map((entry) => entry.id));
}

export function collectEvidenceKeys(
  entries: readonly CoachTimelineEntry[],
): readonly string[] {
  const keys = new Set<string>();
  for (const entry of entries) {
    keys.add(entry.event.category);
    for (const key of entry.decisionReason.evidenceKeys) {
      keys.add(key);
    }
  }
  return Object.freeze([...keys]);
}

export function firstDecisionId(
  entries: readonly CoachTimelineEntry[],
): string | null {
  for (const entry of entries) {
    if (entry.decisionReason.decisionId) return entry.decisionReason.decisionId;
  }
  return null;
}

export function firstRecommendationId(
  entries: readonly CoachTimelineEntry[],
): string | null {
  for (const entry of entries) {
    if (entry.decisionReason.recommendationId) {
      return entry.decisionReason.recommendationId;
    }
  }
  return null;
}

export function createSignal(
  partial: InsightPatternSignal,
): InsightPatternSignal {
  return Object.freeze({
    ...partial,
    evidenceKeys: Object.freeze([...partial.evidenceKeys]),
    timelineEntryIds: Object.freeze([...partial.timelineEntryIds]),
  });
}

/** Confidence from evidence count: 1→0.4, 2→0.6, 3→0.8, ≥4→1.0 */
export function confidenceForSignalCount(count: number): number {
  const n = Math.max(0, Math.floor(count));
  if (n >= 4) return 1;
  if (n === 3) return 0.8;
  if (n === 2) return 0.6;
  if (n === 1) return 0.4;
  return 0;
}

export {
  CoachTimelineEventCategories,
  CoachInsightTypes,
};
