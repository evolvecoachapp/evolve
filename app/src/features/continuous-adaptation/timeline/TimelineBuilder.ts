import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationTimeline, AdaptationTimelineItem } from "../models/AdaptationTimeline";
import { freezeTimeline, freezeTimelineItem } from "../utils/FreezeAdaptationState";
import { sortTimelineItems } from "../utils/TimelineHelpers";

export function buildAdaptationTimeline(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly at: string;
}): AdaptationTimeline {
  const items: AdaptationTimelineItem[] = input.decisions.map((d) =>
    freezeTimelineItem({
      id: `tl-item:${d.id}`,
      subjectId: d.id,
      operation: "adaptation_decision",
      at: d.createdAt,
      metadata: EMPTY_ADAPTATION_METADATA,
    }),
  );
  return freezeTimeline({
    id: input.id,
    athleteId: input.athleteId,
    items: sortTimelineItems(items),
    metadata: EMPTY_ADAPTATION_METADATA,
    createdAt: input.at,
  });
}
