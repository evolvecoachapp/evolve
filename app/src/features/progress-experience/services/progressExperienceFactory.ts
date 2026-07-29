import { backendProgressExperienceService } from "../providers/BackendProgressExperienceService";
import { localProgressExperienceService } from "../providers/LocalProgressExperienceService";
import { mockProgressExperienceService } from "../providers/MockProgressExperienceService";
import type { ProgressExperienceProviderId, ProgressExperienceService } from "./ProgressExperienceService";

function resolveProviderId(): ProgressExperienceProviderId {
  const candidate = process.env.EXPO_PUBLIC_PROGRESS_EXPERIENCE_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createProgressExperienceService(): ProgressExperienceService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendProgressExperienceService;
  }
  if (providerId === "local") {
    return localProgressExperienceService;
  }
  return mockProgressExperienceService;
}
