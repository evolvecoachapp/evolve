import { backendCoachTimelineService } from "../providers/BackendCoachTimelineService";
import { localCoachTimelineService } from "../providers/LocalCoachTimelineService";
import {
  emptyMockCoachTimelineService,
  mockCoachTimelineService,
  resetMockCoachTimelineData,
} from "../providers/MockCoachTimelineService";
import { CoachTimelineFrameworkError } from "../services";

describe("coach-timeline framework providers", () => {
  beforeEach(() => {
    resetMockCoachTimelineData();
  });

  it("mock returns timeline events", async () => {
    const data = await mockCoachTimelineService.getTimeline();
    expect(data.events.length).toBeGreaterThan(0);
    expect(mockCoachTimelineService.providerId).toBe("mock");
  });

  it("empty mock returns no events", async () => {
    const data = await emptyMockCoachTimelineService.getTimeline();
    expect(data.events.length).toBe(0);
  });

  it("backend stub throws", async () => {
    await expect(backendCoachTimelineService.getTimeline()).rejects.toThrow(
      CoachTimelineFrameworkError,
    );
  });

  it("local stub throws", async () => {
    await expect(localCoachTimelineService.getTimeline()).rejects.toThrow(
      CoachTimelineFrameworkError,
    );
  });
});
