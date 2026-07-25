import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import { countPresentFlags, uniqueSorted } from "../utils/AdaptationHelpers";

export interface TimelineMonitorObservation {
  readonly id: string;
  readonly domain: "timeline";
  readonly keys: readonly string[];
  readonly presentCount: number;
  readonly flagCount: number;
  readonly flagsPresent: readonly string[];
  readonly createdAt: string;
}

/** Observation only — no calculations. */
export function observeTimeline(
  input: AdaptationInput,
  at: string,
): TimelineMonitorObservation {
  const keys = uniqueSorted(input.timelineKeys);
  const flagsPresent = uniqueSorted(
    Object.entries(input.signalFlags)
      .filter(([k, v]) => v && k.startsWith("timeline"))
      .map(([k]) => k),
  );
  return Object.freeze({
    id: `obs:timeline:${input.id}`,
    domain: "timeline",
    keys,
    presentCount: keys.length,
    flagCount: countPresentFlags(
      Object.fromEntries(
        Object.entries(input.signalFlags).filter(([k]) => k.startsWith("timeline")),
      ),
    ),
    flagsPresent,
    createdAt: at,
  });
}

export const TimelineMonitor = {
  observe: observeTimeline,
  metadata: EMPTY_ADAPTATION_METADATA,
};
