import {
  backendProgressService,
  createProgressService,
  mockProgressService,
} from "..";
import { ProgressServiceError } from "../progressService";

describe("progressService architecture", () => {
  it("defaults to the mock provider", () => {
    const service = createProgressService("mock");
    expect(service.providerId).toBe("mock");
  });

  it("returns the seeded progress dashboard snapshot", async () => {
    const dashboard = await mockProgressService.getDashboard();

    expect(dashboard.stats).toHaveLength(4);
    expect(dashboard.stats[0].label).toBe("Weight");
    expect(dashboard.stats[0].value).toBe("78.5");
    expect(dashboard.stats[0].unit).toBe("kg");
    expect(dashboard.stats[1].value).toBe("+12%");
    expect(dashboard.stats[2].value).toBe("5");
    expect(dashboard.stats[3].value).toBe("87");
    expect(dashboard.status.level).toBe("on_track");
    expect(dashboard.goal.title).toBe("Reach 75 kg");
    expect(dashboard.strength.overallChangePercent).toBe(12);
    expect(dashboard.milestones).toHaveLength(2);
  });

  it("returns a fresh object on each mock fetch", async () => {
    const first = await mockProgressService.getDashboard();
    const second = await mockProgressService.getDashboard();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it("returns seeded weight history, measurements, photos, records, volume, and insights", async () => {
    const weightHistory = await mockProgressService.getWeightHistory();
    const measurements = await mockProgressService.getMeasurements();
    const photos = await mockProgressService.getProgressPhotos();
    const records = await mockProgressService.getPersonalRecords();
    const volume = await mockProgressService.getTrainingVolume();
    const insights = await mockProgressService.getInsights();

    expect(weightHistory.length).toBeGreaterThan(0);
    expect(measurements.length).toBeGreaterThan(0);
    expect(photos.length).toBeGreaterThan(0);
    expect(records.records.length).toBeGreaterThan(0);
    expect(volume.weeks.length).toBeGreaterThan(0);
    expect(insights.length).toBeGreaterThan(0);
  });

  it("throws when an unconfigured provider is invoked", async () => {
    await expect(backendProgressService.getDashboard()).rejects.toBeInstanceOf(
      ProgressServiceError,
    );
  });
});
