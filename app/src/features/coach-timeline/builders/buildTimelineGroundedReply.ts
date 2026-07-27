import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import { CoachTimelineEventCategories } from "../models/CoachTimelineEvent";
import { CoachTimelineSummaryKinds } from "../models/CoachTimelineSummary";
import type { TimelineQuery } from "../models/TimelineQuery";
import type { TimelineResult } from "../models/TimelineResult";
import type { CoachTimelineService } from "../services/CoachTimelineService";

/**
 * Detect conversation messages that should be answered from the Timeline.
 */
export function isTimelineQueryMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  return (
    /\bwhy did you (lower|reduce|cut|decrease).{0,40}\b(volume|intensity|sets|reps)\b/i.test(
      trimmed,
    ) ||
    /\bwhen did (we|you) (remove|drop|delete|take out)\b/i.test(trimmed) ||
    /\bwhat changed (this|the) week\b/i.test(trimmed) ||
    /\bwhy is my (diet|nutrition|meal plan) different\b/i.test(trimmed) ||
    /\b(show|list|tell) me (the )?(latest|recent) (adjustments|changes|decisions)\b/i.test(
      trimmed,
    ) ||
    /\b(timeline|decision journal|coaching history)\b/i.test(trimmed) ||
    /\bwhy did you (change|modify|adjust)\b/i.test(trimmed)
  );
}

function pickQuery(message: string, athleteId: string): TimelineQuery {
  const lower = message.toLowerCase();

  if (/diet|nutrition|meal/.test(lower)) {
    return Object.freeze({
      athleteId,
      filter: Object.freeze({
        categories: Object.freeze([
          CoachTimelineEventCategories.NUTRITION_CREATED,
          CoachTimelineEventCategories.NUTRITION_MODIFIED,
          CoachTimelineEventCategories.NUTRITION_RESTORED,
        ]),
      }),
      order: "desc" as const,
      limit: 5,
      summaryKind: null,
    });
  }

  if (/remove|deadlift|when did/.test(lower)) {
    return Object.freeze({
      athleteId,
      filter: Object.freeze({
        categories: Object.freeze([
          CoachTimelineEventCategories.WORKOUT_MODIFIED,
          CoachTimelineEventCategories.WORKOUT_RESTORED,
        ]),
        searchText: /deadlift/i.test(message) ? "deadlift" : null,
      }),
      order: "desc" as const,
      limit: 5,
      summaryKind: null,
    });
  }

  if (/volume|intensity|lower|reduce/.test(lower)) {
    return Object.freeze({
      athleteId,
      filter: Object.freeze({
        categories: Object.freeze([
          CoachTimelineEventCategories.WORKOUT_MODIFIED,
          CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
          CoachTimelineEventCategories.COACH_DECISION,
          CoachTimelineEventCategories.FATIGUE_DETECTED,
        ]),
        searchText: /volume/i.test(message) ? "volume" : null,
      }),
      order: "desc" as const,
      limit: 5,
      summaryKind: null,
    });
  }

  if (/this week|what changed/.test(lower)) {
    return Object.freeze({
      athleteId,
      filter: null,
      order: "desc" as const,
      limit: 10,
      summaryKind: CoachTimelineSummaryKinds.LAST_7_DAYS,
    });
  }

  if (/latest|recent|adjustments|decisions/.test(lower)) {
    return Object.freeze({
      athleteId,
      filter: null,
      order: "desc" as const,
      limit: 5,
      summaryKind: CoachTimelineSummaryKinds.LATEST_COACH_DECISIONS,
    });
  }

  return Object.freeze({
    athleteId,
    filter: null,
    order: "desc" as const,
    limit: 5,
    summaryKind: CoachTimelineSummaryKinds.LATEST_COACH_DECISIONS,
  });
}

function formatEntries(entries: readonly CoachTimelineEntry[]): string {
  if (entries.length === 0) {
    return "I have no matching Coach Timeline entries for that question, so I will not invent a reason.";
  }
  return entries
    .map((entry) => {
      const parts = [
        `${entry.timestamp} — ${entry.summary}`,
        `Reason: ${entry.decisionReason.reason}`,
        `Impact: ${entry.decisionReason.impact}`,
        `Expected outcome: ${entry.decisionReason.expectedOutcome}`,
      ];
      if (entry.relatedPlanVersion != null) {
        parts.push(`Related plan version: v${entry.relatedPlanVersion}`);
      }
      return parts.join(". ");
    })
    .join(" ");
}

/**
 * Build a deterministic coaching reply strictly from Timeline entries.
 * Never hallucinates beyond journaled facts.
 */
export function buildTimelineGroundedReply(input: {
  readonly timeline: CoachTimelineService;
  readonly athleteId: string;
  readonly message: string;
}): { readonly message: string; readonly result: TimelineResult } {
  const query = pickQuery(input.message, input.athleteId);
  const result = input.timeline.query(query);
  const body = formatEntries(result.entries);
  const summaryLine = result.summary
    ? ` Summary (${result.summary.title}): ${result.summary.narrative}`
    : "";
  const preface =
    result.entries.length > 0
      ? "From the Coach Timeline decision journal:"
      : "From the Coach Timeline decision journal:";

  return {
    message: `${preface} ${body}${summaryLine}`.trim(),
    result,
  };
}
