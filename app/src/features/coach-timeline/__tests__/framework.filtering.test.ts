import { filterTimeline, searchTimeline } from "../application";
import {
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";

describe("coach-timeline framework filtering", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("filters by category and event type", async () => {
    const data = await filterTimeline({
      service: mockCoachTimelineService,
      filter: {
        period: {
          kind: "week",
          label: "This Week",
          startDate: "2026-07-23",
          endDate: "2026-07-29",
        },
        categories: ["coach"],
        eventTypes: ["coach_insight"],
        searchQuery: null,
        includeAttachments: true,
      },
    });
    expect(data.events.length).toBeGreaterThan(0);
    expect(data.events.every((e) => e.category === "coach")).toBe(true);
    expect(data.events.every((e) => e.type === "coach_insight")).toBe(true);
  });

  it("search is representation only over mock data", async () => {
    const data = await searchTimeline({
      service: mockCoachTimelineService,
      query: "hydration",
    });
    expect(data.searchQuery).toBe("hydration");
    expect(data.events.length).toBeGreaterThan(0);
  });
});
