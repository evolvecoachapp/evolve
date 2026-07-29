export const TimelineGroupKinds = {
  TODAY: "today",
  YESTERDAY: "yesterday",
  EARLIER_THIS_WEEK: "earlier_this_week",
  LAST_WEEK: "last_week",
  THIS_MONTH: "this_month",
  EARLIER: "earlier",
} as const;

export type TimelineGroupKind = (typeof TimelineGroupKinds)[keyof typeof TimelineGroupKinds];

export interface TimelineGroup {
  readonly kind: TimelineGroupKind;
  readonly label: string;
  readonly eventIds: readonly string[];
  readonly eventCount: number;
}

export function createTimelineGroup(input: TimelineGroup): TimelineGroup {
  return Object.freeze({
    ...input,
    eventIds: Object.freeze([...input.eventIds]),
  });
}
