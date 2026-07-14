import type { HomeDashboard } from "../types/homeDashboard";
import {
  HomeServiceError,
  type HomeService,
} from "../types/homeService";

function notConfigured(): never {
  throw new HomeServiceError(
    "local provider is not configured. Integrate on-device storage before enabling this provider.",
    "local",
  );
}

/** Placeholder for on-device cached dashboard data. */
export const localHomeService: HomeService = {
  providerId: "local",

  async getDashboard(): Promise<HomeDashboard> {
    return notConfigured();
  },
};
