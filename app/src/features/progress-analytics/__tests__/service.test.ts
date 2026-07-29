import { createProgressAnalyticsService } from "../services/progressAnalyticsFactory";

describe("progress-analytics service factory", () => {
  it("creates a service with a valid provider id", () => {
    const service = createProgressAnalyticsService();
    expect(["mock", "backend", "local"]).toContain(service.providerId);
  });

  it("defaults to mock provider", () => {
    const service = createProgressAnalyticsService();
    expect(service.providerId).toBe("mock");
  });
});
