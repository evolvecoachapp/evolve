import { loadTimeline } from "../application";
import { TimelineGroupKinds } from "../models";
import {
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";

describe("coach-timeline framework grouping", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("groups events into supported timeline groups", async () => {
    const data = await loadTimeline({ service: mockCoachTimelineService });
    expect(data.groups.length).toBeGreaterThan(0);
    const allowed = new Set(Object.values(TimelineGroupKinds));
    for (const group of data.groups) {
      expect(allowed.has(group.kind)).toBe(true);
      expect(Object.isFrozen(group)).toBe(true);
      expect(Object.isFrozen(group.eventIds)).toBe(true);
      expect(group.eventCount).toBe(group.eventIds.length);
    }
    for (const event of data.events) {
      expect(allowed.has(event.group)).toBe(true);
    }
  });
});
