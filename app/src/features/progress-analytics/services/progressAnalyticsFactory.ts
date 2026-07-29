import { backendProgressAnalyticsService } from "../providers/BackendProgressAnalyticsService";
import { localProgressAnalyticsService } from "../providers/LocalProgressAnalyticsService";
import { mockProgressAnalyticsService } from "../providers/MockProgressAnalyticsService";
import type {
  ProgressAnalyticsProviderId,
  ProgressAnalyticsService,
} from "./ProgressAnalyticsService";

function resolveProviderId(): ProgressAnalyticsProviderId {
  const candidate = process.env.EXPO_PUBLIC_PROGRESS_ANALYTICS_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createProgressAnalyticsService(): ProgressAnalyticsService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendProgressAnalyticsService;
  }
  if (providerId === "local") {
    return localProgressAnalyticsService;
  }
  return mockProgressAnalyticsService;
}
