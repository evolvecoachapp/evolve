import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import type { AdaptationTimelineItem } from "../models/AdaptationTimeline";
import { freezeTimelineItem } from "../utils/FreezeAdaptationState";
import { uniqueSorted } from "../utils/AdaptationHelpers";

/**
 * Historical organization of trend signal keys only — no forecasting.
 */
export function buildTrendItems(input: {
  readonly trendKeys: readonly string[];
  readonly at: string;
}): readonly AdaptationTimelineItem[] {
  const keys = uniqueSorted(input.trendKeys.filter((k) => k.includes("trend")));
  return Object.freeze(
    keys.map((k, i) =>
      freezeTimelineItem({
        id: `trend-item:${i}:${k}`,
        subjectId: k,
        operation: "trend_signal",
        at: input.at,
        metadata: EMPTY_ADAPTATION_METADATA,
      }),
    ),
  );
}
