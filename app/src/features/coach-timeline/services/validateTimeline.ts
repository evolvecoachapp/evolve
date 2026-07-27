import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimeline } from "../models/CoachTimeline";
import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import {
  ALL_COACH_TIMELINE_EVENT_CATEGORIES,
  CoachTimelineEventCategories,
} from "../models/CoachTimelineEvent";

export interface TimelineValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

const VALID_CATEGORIES = new Set<string>(ALL_COACH_TIMELINE_EVENT_CATEGORIES);

const VALID_DOMAINS = new Set([
  "workout",
  "nutrition",
  "recovery",
  "goal",
  "decision",
  "conversation",
  "system",
  "unknown",
]);

/**
 * Validate timeline entry requests and timeline integrity. One responsibility only.
 */
export function validateTimelineEntryRequest(
  request: AppendTimelineEntryRequest,
): TimelineValidation {
  const errors: string[] = [];

  if (!request.id?.trim()) errors.push("Entry id is required");
  if (!request.athleteId?.trim()) errors.push("athleteId is required");
  if (!request.createdAt?.trim()) errors.push("createdAt is required");
  if (!request.summary?.trim()) errors.push("summary is required");
  if (!request.explanation?.trim()) errors.push("explanation is required");
  if (!VALID_CATEGORIES.has(request.category)) {
    errors.push(`Unknown event category: ${String(request.category)}`);
  }
  if (!VALID_DOMAINS.has(request.affectedDomain)) {
    errors.push(`Unknown affected domain: ${String(request.affectedDomain)}`);
  }
  if (!request.decisionReason?.reason?.trim()) {
    errors.push("decisionReason.reason is required");
  }
  if (!request.decisionReason?.impact?.trim()) {
    errors.push("decisionReason.impact is required");
  }
  if (!request.decisionReason?.expectedOutcome?.trim()) {
    errors.push("decisionReason.expectedOutcome is required");
  }
  if (
    typeof request.confidence === "number" &&
    (request.confidence < 0 || request.confidence > 1)
  ) {
    errors.push("confidence must be between 0 and 1");
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function validateTimeline(
  timeline: CoachTimeline | null,
): TimelineValidation {
  if (!timeline) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Timeline is null"]),
    });
  }

  const errors: string[] = [];
  if (!timeline.athleteId?.trim()) errors.push("athleteId is required");
  if (timeline.entryCount !== timeline.entries.length) {
    errors.push("entryCount does not match entries length");
  }

  const seen = new Set<string>();
  let previousTs: string | null = null;
  for (const entry of timeline.entries) {
    if (seen.has(entry.id)) {
      errors.push(`Duplicate entry id: ${entry.id}`);
    }
    seen.add(entry.id);
    if (entry.athleteId !== timeline.athleteId) {
      errors.push(`Entry ${entry.id} athlete mismatch`);
    }
    if (!VALID_CATEGORIES.has(entry.event.category)) {
      errors.push(`Entry ${entry.id} has unknown category`);
    }
    if (previousTs != null && entry.timestamp < previousTs) {
      errors.push(`Entry ${entry.id} breaks chronological order`);
    }
    previousTs = entry.timestamp;
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function isKnownTimelineCategory(category: string): boolean {
  return VALID_CATEGORIES.has(category);
}

export function normalizeUnknownCategory(
  category: string,
): typeof CoachTimelineEventCategories.UNKNOWN | string {
  return VALID_CATEGORIES.has(category)
    ? category
    : CoachTimelineEventCategories.UNKNOWN;
}

export function assertEntryImmutable(entry: CoachTimelineEntry): boolean {
  return Object.isFrozen(entry) && Object.isFrozen(entry.decisionReason);
}
