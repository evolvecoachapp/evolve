import { createCoachTimelineFrameworkService } from "../services/coachTimelineFrameworkFactory";

describe("coach-timeline framework service factory", () => {
  it("creates a service with a valid provider id", () => {
    const service = createCoachTimelineFrameworkService();
    expect(["mock", "backend", "local"]).toContain(service.providerId);
  });

  it("defaults to mock provider", () => {
    const service = createCoachTimelineFrameworkService();
    expect(service.providerId).toBe("mock");
  });
});
