import { mapCoachTimelineData, mapTimelineEvent, mapTimelineStatistics } from "../mappers";
import type { CoachTimelineDataDto, TimelineEventDto } from "../services";

describe("coach-timeline framework mappers", () => {
  const eventDto: TimelineEventDto = {
    id: "e1",
    type: "workout_completed",
    category: "workout",
    priority: "normal",
    title: "Test",
    summary: "Summary",
    occurredAt: "2026-07-29T07:00:00Z",
    group: "today",
    metadata: {
      sourceModule: "workout-engine",
    },
  };

  it("maps event with optional null defaults", () => {
    const event = mapTimelineEvent(eventDto);
    expect(Object.isFrozen(event)).toBe(true);
    expect(event.destination).toBeNull();
    expect(event.badges).toEqual([]);
    expect(event.metadata.correlationId).toBeNull();
    expect(event.metadata.tags).toEqual([]);
  });

  it("maps statistics and freezes nested period", () => {
    const stats = mapTimelineStatistics({
      totalEvents: 1,
      eventsToday: 1,
      eventsThisWeek: 1,
      workoutEvents: 1,
      nutritionEvents: 0,
      recoveryEvents: 0,
      coachEvents: 0,
      achievementEvents: 0,
      period: {
        kind: "today",
        label: "Today",
        startDate: "2026-07-29",
        endDate: "2026-07-29",
      },
    });
    expect(Object.isFrozen(stats)).toBe(true);
    expect(Object.isFrozen(stats.period)).toBe(true);
    expect(stats.dominantCategory).toBeNull();
    expect(stats.destination).toBeNull();
  });

  it("maps full timeline aggregate", () => {
    const dto: CoachTimelineDataDto = {
      period: {
        kind: "week",
        label: "This Week",
        startDate: "2026-07-23",
        endDate: "2026-07-29",
      },
      filter: {
        period: {
          kind: "week",
          label: "This Week",
          startDate: "2026-07-23",
          endDate: "2026-07-29",
        },
        categories: ["workout"],
        eventTypes: ["workout_completed"],
        includeAttachments: true,
      },
      events: [eventDto],
      groups: [
        {
          kind: "today",
          label: "Today",
          eventIds: ["e1"],
          eventCount: 1,
        },
      ],
      sections: [
        {
          id: "s1",
          title: "Today",
          group: "today",
          eventCount: 1,
        },
      ],
      statistics: {
        totalEvents: 1,
        eventsToday: 1,
        eventsThisWeek: 1,
        workoutEvents: 1,
        nutritionEvents: 0,
        recoveryEvents: 0,
        coachEvents: 0,
        achievementEvents: 0,
        period: {
          kind: "week",
          label: "This Week",
          startDate: "2026-07-23",
          endDate: "2026-07-29",
        },
      },
      pagination: {
        pageSize: 5,
        hasMore: false,
      },
    };
    const data = mapCoachTimelineData(dto);
    expect(Object.isFrozen(data)).toBe(true);
    expect(data.snapshot).toBeNull();
    expect(data.searchQuery).toBeNull();
    expect(data.pagination.totalCount).toBeNull();
  });
});
