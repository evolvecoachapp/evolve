import type { CoachTimelineEntry } from "../../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";
import type { CoachingSessionRecommendation } from "../models/CoachingSessionRecommendation";

/**
 * Collect recommendation summary from existing Recommendation Engine refs.
 * No new recommendation logic.
 */
export function collectRecommendationContext(input: {
  readonly entries?: readonly CoachTimelineEntry[];
  readonly evidence?: CoachingSessionEvidence | null;
  readonly recommendationTitles?: readonly string[];
}): CoachingSessionRecommendation {
  const recommendationIds = new Set<string>();
  const titles: string[] = [];

  for (const id of input.evidence?.recommendationIds ?? []) {
    recommendationIds.add(id);
  }

  for (const entry of input.entries ?? []) {
    if (entry.decisionReason.recommendationId) {
      recommendationIds.add(entry.decisionReason.recommendationId);
    }
  }

  for (const title of input.recommendationTitles ?? []) {
    titles.push(title);
  }

  const ids = Object.freeze([...recommendationIds]);
  const frozenTitles = Object.freeze(titles.slice(0, 5));
  const present = ids.length > 0 || frozenTitles.length > 0;

  return Object.freeze({
    recommendationIds: ids,
    titles: frozenTitles,
    summary: present
      ? `Recommendation evidence present (${ids.length} id(s), ${frozenTitles.length} title(s)).`
      : "No recommendation engine references available.",
    present,
  });
}
