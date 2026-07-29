import type { TimelineCategory } from "./TimelineCategory";
import type { TimelineEventType } from "./TimelineEventType";
import type { TimelinePeriod } from "./TimelinePeriod";

export interface TimelineStatistics {
  readonly totalEvents: number;
  readonly eventsToday: number;
  readonly eventsThisWeek: number;
  readonly workoutEvents: number;
  readonly nutritionEvents: number;
  readonly recoveryEvents: number;
  readonly coachEvents: number;
  readonly achievementEvents: number;
  readonly dominantCategory: TimelineCategory | null;
  readonly dominantEventType: TimelineEventType | null;
  readonly period: TimelinePeriod;
  readonly destination: string | null;
}

export function createTimelineStatistics(input: TimelineStatistics): TimelineStatistics {
  return Object.freeze({
    ...input,
    period: Object.freeze({ ...input.period }),
  });
}
