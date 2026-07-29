import { loadMoreTimeline, loadTimeline } from "../application";
import {
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";

describe("coach-timeline framework pagination", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("represents cursor-based pagination", async () => {
    const first = await loadTimeline({ service: mockCoachTimelineService });
    expect(first.pagination.pageSize).toBe(5);
    expect(first.pagination.hasMore).toBe(true);
    expect(first.pagination.nextCursor).not.toBeNull();
    expect(Object.isFrozen(first.pagination.nextCursor)).toBe(true);

    const more = await loadMoreTimeline({
      service: mockCoachTimelineService,
      cursor: {
        value: first.pagination.nextCursor!.value,
        occurredAt: first.pagination.nextCursor!.occurredAt,
      },
    });
    expect(more.events.length).toBeGreaterThan(first.events.length);
    expect(more.pagination.totalCount).toBeGreaterThanOrEqual(more.events.length);
  });
});
