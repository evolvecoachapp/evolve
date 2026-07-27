import type { CoachTimelineEntry } from "../../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";
import type { CoachingSessionExplanation } from "../models/CoachingSessionExplanation";

/**
 * Collect reasoning / explainability summary from existing timeline + evidence refs.
 * No new LLM reasoning.
 */
export function collectExplanationContext(input: {
  readonly entries?: readonly CoachTimelineEntry[];
  readonly evidence?: CoachingSessionEvidence | null;
}): CoachingSessionExplanation {
  const explanationIds = new Set<string>();
  const reasoningPoints: string[] = [];

  for (const id of input.evidence?.explanationIds ?? []) {
    explanationIds.add(id);
  }

  for (const entry of input.entries ?? []) {
    const explanationId = entry.metadata["explanationId"];
    if (explanationId) explanationIds.add(explanationId);
    if (entry.decisionReason.reason) {
      reasoningPoints.push(entry.decisionReason.reason);
    }
    if (entry.explanation) {
      reasoningPoints.push(entry.explanation);
    }
  }

  const ids = Object.freeze([...explanationIds]);
  const points = Object.freeze(reasoningPoints.slice(0, 6));
  const present = ids.length > 0 || points.length > 0;

  return Object.freeze({
    explanationIds: ids,
    reasoningPoints: points,
    summary: present
      ? `Reasoning evidence present (${ids.length} explanation id(s), ${points.length} point(s)).`
      : "No explainability references available.",
    present,
  });
}
