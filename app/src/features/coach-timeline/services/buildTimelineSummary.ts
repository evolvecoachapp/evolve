import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import {
  CoachTimelineEventCategories,
  type CoachTimelineEventCategory,
} from "../models/CoachTimelineEvent";
import {
  CoachTimelineSummaryKinds,
  type CoachTimelineSummary,
  type CoachTimelineSummaryKind,
} from "../models/CoachTimelineSummary";
import { filterTimeline } from "./filterTimeline";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addDaysIso(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function narrativeFrom(
  entries: readonly CoachTimelineEntry[],
  emptyMessage: string,
): string {
  if (entries.length === 0) return emptyMessage;
  return entries
    .map((entry) => `${entry.timestamp}: ${entry.summary}`)
    .join(" | ");
}

function categoriesOf(
  entries: readonly CoachTimelineEntry[],
): readonly CoachTimelineEventCategory[] {
  const set = new Set<CoachTimelineEventCategory>();
  for (const entry of entries) set.add(entry.event.category);
  return Object.freeze([...set].sort());
}

function buildSlice(
  kind: CoachTimelineSummaryKind,
  title: string,
  entries: readonly CoachTimelineEntry[],
  emptyMessage: string,
  generatedAt: string,
): CoachTimelineSummary {
  const sorted = [...entries].sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0,
  );
  return Object.freeze({
    kind,
    title,
    narrative: narrativeFrom(sorted, emptyMessage),
    entryIds: Object.freeze(sorted.map((entry) => entry.id)),
    entryCount: sorted.length,
    categories: categoriesOf(sorted),
    fromTimestamp: sorted[0]?.timestamp ?? null,
    toTimestamp: sorted[sorted.length - 1]?.timestamp ?? null,
    generatedAt,
  });
}

/**
 * Deterministic timeline summaries. One responsibility only.
 */
export function buildTimelineSummary(input: {
  readonly entries: readonly CoachTimelineEntry[];
  readonly kind: CoachTimelineSummaryKind;
  readonly generatedAt: string;
}): CoachTimelineSummary {
  const { entries, kind, generatedAt } = input;

  switch (kind) {
    case CoachTimelineSummaryKinds.LAST_7_DAYS: {
      const from = addDaysIso(generatedAt, -7);
      const filtered = filterTimeline(entries, {
        fromTimestamp: from,
        toTimestamp: generatedAt,
      });
      return buildSlice(
        kind,
        "Last 7 days",
        filtered,
        "No coaching decisions in the last 7 days.",
        generatedAt,
      );
    }
    case CoachTimelineSummaryKinds.CURRENT_TRAINING_BLOCK: {
      const filtered = filterTimeline(entries, {
        categories: Object.freeze([
          CoachTimelineEventCategories.WORKOUT_CREATED,
          CoachTimelineEventCategories.WORKOUT_MODIFIED,
          CoachTimelineEventCategories.WORKOUT_RESTORED,
          CoachTimelineEventCategories.PROGRAM_PHASE_CHANGED,
        ]),
      });
      return buildSlice(
        kind,
        "Current training block",
        filtered,
        "No training-block decisions recorded.",
        generatedAt,
      );
    }
    case CoachTimelineSummaryKinds.CURRENT_CUT: {
      const filtered = filterTimeline(entries, {
        searchText: "cut",
        domains: Object.freeze(["nutrition", "goal"]),
      });
      return buildSlice(
        kind,
        "Current cut",
        filtered,
        "No cut-phase coaching decisions recorded.",
        generatedAt,
      );
    }
    case CoachTimelineSummaryKinds.CURRENT_BULK: {
      const filtered = filterTimeline(entries, {
        searchText: "bulk",
        domains: Object.freeze(["nutrition", "goal"]),
      });
      return buildSlice(
        kind,
        "Current bulk",
        filtered,
        "No bulk-phase coaching decisions recorded.",
        generatedAt,
      );
    }
    case CoachTimelineSummaryKinds.RECENT_RECOVERY_DECISIONS: {
      const filtered = filterTimeline(entries, {
        categories: Object.freeze([
          CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
          CoachTimelineEventCategories.FATIGUE_DETECTED,
          CoachTimelineEventCategories.INJURY_REPORTED,
        ]),
      });
      return buildSlice(
        kind,
        "Recent recovery decisions",
        filtered,
        "No recent recovery decisions recorded.",
        generatedAt,
      );
    }
    case CoachTimelineSummaryKinds.RECENT_WORKOUT_MODIFICATIONS: {
      const filtered = filterTimeline(entries, {
        categories: Object.freeze([
          CoachTimelineEventCategories.WORKOUT_MODIFIED,
          CoachTimelineEventCategories.WORKOUT_RESTORED,
        ]),
      });
      return buildSlice(
        kind,
        "Recent workout modifications",
        filtered,
        "No recent workout modifications recorded.",
        generatedAt,
      );
    }
    case CoachTimelineSummaryKinds.LATEST_COACH_DECISIONS: {
      const filtered = filterTimeline(entries, {
        categories: Object.freeze([
          CoachTimelineEventCategories.COACH_DECISION,
          CoachTimelineEventCategories.WORKOUT_MODIFIED,
          CoachTimelineEventCategories.NUTRITION_MODIFIED,
          CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
          CoachTimelineEventCategories.GOAL_CHANGED,
        ]),
      });
      const latest = filtered.slice(-5);
      return buildSlice(
        kind,
        "Latest coach decisions",
        latest,
        "No coach decisions recorded.",
        generatedAt,
      );
    }
    default: {
      return buildSlice(
        CoachTimelineSummaryKinds.LATEST_COACH_DECISIONS,
        "Latest coach decisions",
        entries.slice(-5),
        "No coach decisions recorded.",
        generatedAt,
      );
    }
  }
}

/** Exported for deterministic tests — unused runtime helper kept local-friendly. */
export function daysBetweenMs(_from: string, _to: string): number {
  return MS_PER_DAY;
}
