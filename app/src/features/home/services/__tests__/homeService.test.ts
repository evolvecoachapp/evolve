import { createHomeService, mockHomeService, backendHomeService } from "..";
import { HomeServiceError } from "../../types/homeService";

describe("homeService architecture", () => {
  it("defaults to the mock provider", () => {
    const service = createHomeService("mock");
    expect(service.providerId).toBe("mock");
  });

  it("returns the seeded dashboard snapshot", async () => {
    const dashboard = await mockHomeService.getDashboard();

    expect(dashboard.recovery.score).toBe(82);
    expect(dashboard.streak.days).toBe(5);
    expect(dashboard.workoutPreview.name).toBe("Upper Body Strength");
    expect(dashboard.coachSummary.message).toContain("recovery score");
    expect(dashboard.notifications).toEqual([]);
  });

  it("returns a fresh object on each mock fetch", async () => {
    const first = await mockHomeService.getDashboard();
    const second = await mockHomeService.getDashboard();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it("throws when an unconfigured provider is invoked", async () => {
    await expect(backendHomeService.getDashboard()).rejects.toBeInstanceOf(HomeServiceError);
  });
});
