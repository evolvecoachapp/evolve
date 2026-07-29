import { loadTimeline } from "../application";
import {
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";

describe("coach-timeline framework immutability", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("freezes aggregate and nested collections", async () => {
    const data = await loadTimeline({ service: mockCoachTimelineService });
    expect(Object.isFrozen(data)).toBe(true);
    expect(Object.isFrozen(data.events)).toBe(true);
    expect(Object.isFrozen(data.groups)).toBe(true);
    expect(Object.isFrozen(data.sections)).toBe(true);
    expect(Object.isFrozen(data.filter)).toBe(true);
    expect(Object.isFrozen(data.filter.categories)).toBe(true);
    expect(Object.isFrozen(data.pagination)).toBe(true);
    expect(Object.isFrozen(data.statistics)).toBe(true);
    if (data.events[0]) {
      expect(Object.isFrozen(data.events[0])).toBe(true);
      expect(Object.isFrozen(data.events[0].badges)).toBe(true);
      expect(Object.isFrozen(data.events[0].metadata)).toBe(true);
    }
    if (data.snapshot) {
      expect(Object.isFrozen(data.snapshot)).toBe(true);
      expect(Object.isFrozen(data.snapshot.events)).toBe(true);
    }
  });
});
