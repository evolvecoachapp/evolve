import type { CoachInsight } from "../models/CoachInsight";
import {
  ALL_COACH_INSIGHT_TYPES,
  CoachInsightTypes,
} from "../models/CoachInsightType";
import {
  ALL_COACH_INSIGHT_SEVERITIES,
} from "../models/CoachInsightSeverity";

export interface InsightValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const VALID_TYPES = new Set<string>(ALL_COACH_INSIGHT_TYPES);
const VALID_SEVERITIES = new Set<string>(ALL_COACH_INSIGHT_SEVERITIES);
const VALID_DOMAINS = new Set([
  "workout",
  "nutrition",
  "recovery",
  "goal",
  "decision",
  "program",
  "system",
  "unknown",
]);

/**
 * Validate insight integrity. One responsibility only.
 */
export function validateInsight(insight: CoachInsight): InsightValidation {
  const errors: string[] = [];

  if (!insight.id?.trim()) errors.push("Insight id is required");
  if (!insight.athleteId?.trim()) errors.push("athleteId is required");
  if (!insight.timestamp?.trim()) errors.push("timestamp is required");
  if (!insight.title?.trim()) errors.push("title is required");
  if (!insight.summary?.trim()) errors.push("summary is required");
  if (!VALID_TYPES.has(insight.type)) {
    errors.push(`Unknown insight type: ${String(insight.type)}`);
  }
  if (!VALID_SEVERITIES.has(insight.severity)) {
    errors.push(`Unknown severity: ${String(insight.severity)}`);
  }
  if (!VALID_DOMAINS.has(insight.affectedDomain)) {
    errors.push(`Unknown affected domain: ${String(insight.affectedDomain)}`);
  }
  if (!insight.reason?.reason?.trim()) {
    errors.push("reason.reason is required");
  }
  if (!insight.reason?.impact?.trim()) {
    errors.push("reason.impact is required");
  }
  if (!insight.recommendation?.action?.trim()) {
    errors.push("recommendation.action is required");
  }
  if (!insight.recommendation?.expectedOutcome?.trim()) {
    errors.push("recommendation.expectedOutcome is required");
  }
  if (!insight.expectedOutcome?.trim()) {
    errors.push("expectedOutcome is required");
  }
  if (
    typeof insight.confidence !== "number" ||
    insight.confidence < 0 ||
    insight.confidence > 1
  ) {
    errors.push("confidence must be between 0 and 1");
  }
  if (!insight.evidence || insight.evidence.signalCount < 1) {
    errors.push("evidence.signalCount must be at least 1");
  }
  if (
    !insight.relatedTimelineEntryIds ||
    insight.relatedTimelineEntryIds.length === 0
  ) {
    errors.push("relatedTimelineEntryIds must not be empty");
  }
  if (insight.evidence?.timelineEntryIds) {
    for (const id of insight.relatedTimelineEntryIds) {
      if (!insight.evidence.timelineEntryIds.includes(id)) {
        errors.push(
          `relatedTimelineEntryId ${id} missing from evidence.timelineEntryIds`,
        );
      }
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function validateInsights(
  insights: readonly CoachInsight[],
): InsightValidation {
  if (insights.length === 0) {
    return Object.freeze({
      valid: true,
      errors: Object.freeze([] as string[]),
    });
  }

  const errors: string[] = [];
  const seen = new Set<string>();
  for (const insight of insights) {
    if (seen.has(insight.id)) {
      errors.push(`Duplicate insight id: ${insight.id}`);
    }
    seen.add(insight.id);
    const result = validateInsight(insight);
    for (const error of result.errors) {
      errors.push(`${insight.id}: ${error}`);
    }
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertInsightImmutable(insight: CoachInsight): boolean {
  return (
    Object.isFrozen(insight) &&
    Object.isFrozen(insight.evidence) &&
    Object.isFrozen(insight.reason) &&
    Object.isFrozen(insight.recommendation)
  );
}

export function isKnownInsightType(type: string): boolean {
  return VALID_TYPES.has(type);
}

export function normalizeUnknownInsightType(
  type: string,
): typeof CoachInsightTypes.UNKNOWN | string {
  return VALID_TYPES.has(type) ? type : CoachInsightTypes.UNKNOWN;
}
