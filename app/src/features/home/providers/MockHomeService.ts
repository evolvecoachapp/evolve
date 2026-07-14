import { mockHomeDashboardData } from "../mocks/dashboardData";
import type { HomeDashboard } from "../types/homeDashboard";
import type { HomeService } from "../types/homeService";

/** Default provider — returns the seeded local dashboard snapshot. */
export const mockHomeService: HomeService = {
  providerId: "mock",

  async getDashboard(): Promise<HomeDashboard> {
    return { ...mockHomeDashboardData };
  },
};
