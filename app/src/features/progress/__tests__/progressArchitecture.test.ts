import { mockProgressDashboardData } from "../mocks";
import { mockProgressService } from "../providers/MockProgressService";

describe("progress architecture", () => {
  it("exposes the same stat values as the legacy progress mock", async () => {
    const dashboard = await mockProgressService.getDashboard();

    expect(dashboard.stats).toHaveLength(mockProgressDashboardData.stats.length);
    expect(dashboard.stats.map((stat) => stat.label)).toEqual(
      mockProgressDashboardData.stats.map((stat) => stat.label),
    );
    expect(dashboard.stats.map((stat) => stat.value)).toEqual(
      mockProgressDashboardData.stats.map((stat) => stat.value),
    );
    expect(dashboard.stats.map((stat) => stat.unit)).toEqual(
      mockProgressDashboardData.stats.map((stat) => stat.unit),
    );
    expect(dashboard.stats.map((stat) => stat.trend)).toEqual(
      mockProgressDashboardData.stats.map((stat) => stat.trend),
    );
    expect(dashboard.stats.map((stat) => stat.icon)).toEqual(
      mockProgressDashboardData.stats.map((stat) => stat.icon),
    );
  });
});
