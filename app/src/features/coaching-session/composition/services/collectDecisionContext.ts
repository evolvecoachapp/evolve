import type { CoachTimelineEntry } from "../../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSessionDecision } from "../models/CoachingSessionDecision";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";

/**
 * Collect decision summary from existing Decision Engine refs (timeline / evidence).
 * No new decision reasoning.
 */
export function collectDecisionContext(input: {
  readonly entries?: readonly CoachTimelineEntry[];
  readonly evidence?: CoachingSessionEvidence | null;
}): CoachingSessionDecision {
  const decisionIds = new Set<string>();
  const titles: string[] = [];

  for (const id of input.evidence?.decisionIds ?? []) {
    decisionIds.add(id);
  }

  for (const entry of input.entries ?? []) {
    if (entry.decisionReason.decisionId) {
      decisionIds.add(entry.decisionReason.decisionId);
      titles.push(entry.summary);
    }
  }

  const ids = Object.freeze([...decisionIds]);
  const frozenTitles = Object.freeze(titles.slice(0, 5));
  const present = ids.length > 0;

  return Object.freeze({
    decisionIds: ids,
    titles: frozenTitles,
    summary: present
      ? `Decision evidence present (${ids.length} id(s)).`
      : "No decision engine references available.",
    present,
  });
}
