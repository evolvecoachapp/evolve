import type { HomeDashboard } from "../types/homeDashboard";
import {
  HomeServiceError,
  type HomeService,
} from "../types/homeService";

function notConfigured(): never {
  throw new HomeServiceError(
    "backend provider is not configured. Wire the EVOLVE API before enabling this provider.",
    "backend",
  );
}

/** Placeholder for the EVOLVE backend — implement when API integration is available. */
export const backendHomeService: HomeService = {
  providerId: "backend",

  async getDashboard(): Promise<HomeDashboard> {
    return notConfigured();
  },
};
