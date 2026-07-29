import { CoachTimelineViewModel } from "../viewmodels";
import {
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";
import type { CoachTimelineFrameworkService } from "../services";
import { CoachTimelineFrameworkError } from "../services";

describe("CoachTimelineViewModel", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("loads timeline and notifies subscribers", async () => {
    const vm = new CoachTimelineViewModel({ service: mockCoachTimelineService });
    let calls = 0;
    vm.subscribe(() => {
      calls += 1;
    });
    await vm.loadTimeline();
    expect(vm.events.length).toBeGreaterThan(0);
    expect(vm.error).toBeNull();
    expect(vm.loading.isLoading).toBe(false);
    expect(calls).toBeGreaterThan(0);
  });

  it("clears data on load failure", async () => {
    const failing: CoachTimelineFrameworkService = {
      providerId: "mock",
      async getTimeline() { throw new CoachTimelineFrameworkError("load failed", "mock"); },
      async loadMore() { throw new CoachTimelineFrameworkError("load more failed", "mock"); },
      async filterTimeline() { throw new CoachTimelineFrameworkError("filter failed", "mock"); },
      async searchTimeline() { throw new CoachTimelineFrameworkError("search failed", "mock"); },
      async getStatistics() { throw new CoachTimelineFrameworkError("stats failed", "mock"); },
      async getSnapshot() { throw new CoachTimelineFrameworkError("snapshot failed", "mock"); },
    };
    const vm = new CoachTimelineViewModel({ service: failing });
    await vm.loadTimeline();
    expect(vm.events.length).toBe(0);
    expect(vm.error).not.toBeNull();
    expect(vm.isEmpty).toBe(true);
  });

  it("refresh keeps data on failure", async () => {
    let fail = false;
    const service: CoachTimelineFrameworkService = {
      providerId: "mock",
      async getTimeline(filter, cursor) {
        if (fail) throw new CoachTimelineFrameworkError("refresh failed", "mock");
        return mockCoachTimelineService.getTimeline(filter, cursor);
      },
      async loadMore(cursor) {
        return mockCoachTimelineService.loadMore(cursor);
      },
      async filterTimeline(filter) {
        return mockCoachTimelineService.filterTimeline(filter);
      },
      async searchTimeline(query, filter) {
        return mockCoachTimelineService.searchTimeline(query, filter);
      },
      async getStatistics(period) {
        return mockCoachTimelineService.getStatistics(period);
      },
      async getSnapshot(period) {
        return mockCoachTimelineService.getSnapshot(period);
      },
    };
    const vm = new CoachTimelineViewModel({ service });
    await vm.loadTimeline();
    const count = vm.events.length;
    fail = true;
    await vm.refresh();
    expect(vm.events.length).toBe(count);
    expect(vm.error).not.toBeNull();
  });

  it("loads more when cursor available", async () => {
    const vm = new CoachTimelineViewModel({ service: mockCoachTimelineService });
    await vm.loadTimeline();
    const before = vm.events.length;
    expect(vm.hasMore).toBe(true);
    await vm.loadMore();
    expect(vm.events.length).toBeGreaterThan(before);
  });

  it("applies filter and search", async () => {
    const vm = new CoachTimelineViewModel({ service: mockCoachTimelineService });
    await vm.applyFilter({
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
    });
    expect(vm.events.every((e) => e.category === "workout")).toBe(true);
    await vm.search("bench");
    expect(vm.searchQuery).toBe("bench");
  });

  it("loads statistics and snapshot slices", async () => {
    const vm = new CoachTimelineViewModel({ service: mockCoachTimelineService });
    await vm.loadStatistics();
    expect(vm.statistics).not.toBeNull();
    await vm.loadSnapshot();
    expect(vm.snapshot).not.toBeNull();
  });
});
