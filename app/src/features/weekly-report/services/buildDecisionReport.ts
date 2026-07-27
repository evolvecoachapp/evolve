import type { CoachTimelineEntry } from "../../coach-timeline/models/CoachTimelineEntry";
import {
  CoachTimelineEventCategories,
  type CoachTimelineEventCategory,
} from "../../coach-timeline/models/CoachTimelineEvent";
import type { WeeklyDecisionReport } from "../models/WeeklyDecisionReport";

export interface BuildDecisionReportInput {
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly limit?: number;
}

const RESTORE_CATEGORIES: ReadonlySet<CoachTimelineEventCategory> = new Set([
  CoachTimelineEventCategories.WORKOUT_RESTORED,
  CoachTimelineEventCategories.NUTRITION_RESTORED,
]);

const MODIFICATION_CATEGORIES: ReadonlySet<CoachTimelineEventCategory> = new Set([
  CoachTimelineEventCategories.WORKOUT_MODIFIED,
  CoachTimelineEventCategories.NUTRITION_MODIFIED,
  CoachTimelineEventCategories.PROGRAM_PHASE_CHANGED,
]);

const INTERVENTION_CATEGORIES: ReadonlySet<CoachTimelineEventCategory> = new Set([
  CoachTimelineEventCategories.COACH_DECISION,
  CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
  CoachTimelineEventCategories.FATIGUE_DETECTED,
  CoachTimelineEventCategories.INJURY_REPORTED,
]);

const DECISION_CATEGORIES: ReadonlySet<CoachTimelineEventCategory> = new Set([
  ...RESTORE_CATEGORIES,
  ...MODIFICATION_CATEGORIES,
  ...INTERVENTION_CATEGORIES,
  CoachTimelineEventCategories.WORKOUT_CREATED,
  CoachTimelineEventCategories.NUTRITION_CREATED,
  CoachTimelineEventCategories.GOAL_CHANGED,
  CoachTimelineEventCategories.GOAL_PROGRESS,
]);

/**
 * Compose Weekly Coach Report decision section from Coach Timeline.
 * Projects weekly decisions, restores, modifications, and interventions.
 * No duplicated timeline logic.
 */
export function buildDecisionReport(
  input: BuildDecisionReportInput = {},
): WeeklyDecisionReport {
  const entries = input.timelineEntries ?? Object.freeze([]);
  const limit = input.limit ?? 20;

  const decisionEntries = [...entries]
    .filter((e) => DECISION_CATEGORIES.has(e.event.category))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const restoreCount = decisionEntries.filter((e) =>
    RESTORE_CATEGORIES.has(e.event.category),
  ).length;
  const modificationCount = decisionEntries.filter((e) =>
    MODIFICATION_CATEGORIES.has(e.event.category),
  ).length;
  const interventionCount = decisionEntries.filter((e) =>
    INTERVENTION_CATEGORIES.has(e.event.category),
  ).length;

  const items = Object.freeze(
    decisionEntries.slice(0, limit).map((entry) =>
      Object.freeze({
        id: entry.id,
        category: entry.event.category,
        summary: entry.summary,
        timestamp: entry.timestamp,
        affectedDomain: entry.affectedDomain ?? null,
      }),
    ),
  );

  if (items.length === 0) {
    return Object.freeze({
      present: false,
      decisionCount: 0,
      restoreCount: 0,
      modificationCount: 0,
      interventionCount: 0,
      items: Object.freeze([]),
      summary: "No coaching decisions this week.",
    });
  }

  return Object.freeze({
    present: true,
    decisionCount: decisionEntries.length,
    restoreCount,
    modificationCount,
    interventionCount,
    items,
    summary: [
      `${decisionEntries.length} decision(s)`,
      modificationCount > 0 ? `${modificationCount} modification(s)` : null,
      restoreCount > 0 ? `${restoreCount} restore(s)` : null,
      interventionCount > 0 ? `${interventionCount} intervention(s)` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  });
}
