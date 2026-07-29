import { backendProfileExperienceService } from "../providers/BackendProfileExperienceService";
import { localProfileExperienceService } from "../providers/LocalProfileExperienceService";
import { mockProfileExperienceService } from "../providers/MockProfileExperienceService";
import type {
  ProfileExperienceProviderId,
  ProfileExperienceService,
} from "./ProfileExperienceService";

function resolveProviderId(): ProfileExperienceProviderId {
  const candidate = process.env.EXPO_PUBLIC_PROFILE_EXPERIENCE_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createProfileExperienceService(): ProfileExperienceService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendProfileExperienceService;
  }
  if (providerId === "local") {
    return localProfileExperienceService;
  }
  return mockProfileExperienceService;
}
