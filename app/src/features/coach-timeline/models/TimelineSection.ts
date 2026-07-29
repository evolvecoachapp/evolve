import type { TimelineCategory } from "./TimelineCategory";
import type { TimelineGroupKind } from "./TimelineGroup";

export interface TimelineSection {
  readonly id: string;
  readonly title: string;
  readonly group: TimelineGroupKind;
  readonly category: TimelineCategory | null;
  readonly eventCount: number;
  readonly destination: string | null;
}

export function createTimelineSection(input: TimelineSection): TimelineSection {
  return Object.freeze({ ...input });
}
