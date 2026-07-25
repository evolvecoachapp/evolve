import type { ExplanationTimeline } from "../models/ExplanationTimeline";
import { EMPTY_EXPLANATION_METADATA } from "../models/ExplanationMetadata";
import { freezeTimeline, freezeTimelineItem } from "../utils/FreezeExplanationState";

export function buildExplanationTimeline(input: {
  readonly id: string;
  readonly subjectIds: readonly string[];
  readonly at: string;
}): ExplanationTimeline {
  return freezeTimeline({
    id: input.id,
    items: Object.freeze(
      input.subjectIds.map((subjectId, i) =>
        freezeTimelineItem({
          id: `timeline:${subjectId}:${i}`,
          subjectId,
          operation: "explain",
          at: input.at,
          metadata: EMPTY_EXPLANATION_METADATA,
        }),
      ),
    ),
    createdAt: input.at,
  });
}
