import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationTimeline } from "../models/AdaptationTimeline";
import type { AdaptationWindow } from "../models/AdaptationWindow";
import { freezeWindow } from "../utils/FreezeAdaptationState";

export function buildAdaptationWindow(input: {
  readonly id: string;
  readonly timeline: AdaptationTimeline | null;
  readonly startAt: string;
  readonly endAt: string;
}): AdaptationWindow {
  const itemIds = input.timeline
    ? input.timeline.items
        .filter((i) => i.at >= input.startAt && i.at <= input.endAt)
        .map((i) => i.id)
    : [];
  return freezeWindow({
    id: input.id,
    startAt: input.startAt,
    endAt: input.endAt,
    itemIds: Object.freeze(itemIds),
    metadata: EMPTY_ADAPTATION_METADATA,
  });
}
