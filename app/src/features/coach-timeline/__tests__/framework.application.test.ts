import {
  filterTimeline,
  loadMoreTimeline,
  loadTimeline,
  loadTimelineSnapshot,
  loadTimelineStatistics,
  refreshTimeline,
  searchTimeline,
} from "../application";
import {
  emptyMockCoachTimelineService,
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";
import type { CoachTimelineFrameworkService } from "../services";
import { CoachTimelineFrameworkError } from "../services";

function createFailingService(): CoachTimelineFrameworkService {
  return {
    providerId: "mock",
    async getTimeline() { throw new CoachTimelineFrameworkError("load failed", "mock"); },
    async loadMore() { throw new CoachTimelineFrameworkError("load more failed", "mock"); },
    async filterTimeline() { throw new CoachTimelineFrameworkError("filter failed", "mock"); },
    async searchTimeline() { throw new CoachTimelineFrameworkError("search failed", "mock"); },
    async getStatistics() { throw new CoachTimelineFrameworkError("stats failed", "mock"); },
    async getSnapshot() { throw new CoachTimelineFrameworkError("snapshot failed", "mock"); },
  };
}

describe("coach-timeline framework application APIs", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("loads timeline with immutable data", async () => {
    const data = await loadTimeline({ service: mockCoachTimelineService });
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(data.events)).toBe(true);
    expect(data.events.length).toBeGreaterThan(0);
  });

  it("refresh returns fresh mapped data", async () => {
    const first = await loadTimeline({ service: mockCoachTimelineService });
    const second = await refreshTimeline({ service: mockCoachTimelineService });
    expect(second).not.toBe(first);
    expect(second.statistics.totalEvents).toBe(first.statistics.totalEvents);
  });

  it("loads more timeline pages", async () => {
    const first = await loadTimeline({ service: mockCoachTimelineService });
    expect(first.pagination.hasMore).toBe(true);
    expect(first.pagination.nextCursor).not.toBeNull();
    const more = await loadMoreTimeline({
      service: mockCoachTimelineService,
      cursor: {
        value: first.pagination.nextCursor!.value,
        occurredAt: first.pagination.nextCursor!.occurredAt,
      },
    });
    expect(more.events.length).toBeGreaterThan(first.events.length);
  });

  it("filters timeline events", async () => {
    const data = await filterTimeline({
      service: mockCoachTimelineService,
      filter: {
        period: {
          kind: "week",
          label: "This Week",
          startDate: "2026-07-23",
          endDate: "2026-07-29",
        },
        categories: ["workout"],
        eventTypes: ["workout_completed"],
        searchQuery: null,
        includeAttachments: true,
      },
    });
    expect(data.events.every((e) => e.category === "workout")).toBe(true);
  });

  it("searches timeline events", async () => {
    const data = await searchTimeline({
      service: mockCoachTimelineService,
      query: "bench",
    });
    expect(data.events.length).toBeGreaterThan(0);
    expect(data.searchQuery).toBe("bench");
  });

  it("loads timeline statistics", async () => {
    const stats = await loadTimelineStatistics({ service: mockCoachTimelineService });
    expect(Object.isFrozen(stats)).toBe(true);
    expect(stats.totalEvents).toBeGreaterThan(0);
  });

  it("loads timeline snapshot", async () => {
    const snapshot = await loadTimelineSnapshot({ service: mockCoachTimelineService });
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(snapshot.id).toBeTruthy();
  });

  it("empty mock returns empty events", async () => {
    const data = await loadTimeline({ service: emptyMockCoachTimelineService });
    expect(data.events.length).toBe(0);
  });

  it("failing service rejects", async () => {
    await expect(loadTimeline({ service: createFailingService() })).rejects.toThrow(
      CoachTimelineFrameworkError,
    );
  });
});
