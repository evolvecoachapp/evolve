import { backendRecoveryExperienceService } from "../providers/BackendRecoveryExperienceService";
import { localRecoveryExperienceService } from "../providers/LocalRecoveryExperienceService";
import { mockRecoveryExperienceService } from "../providers/MockRecoveryExperienceService";
import type {
  RecoveryExperienceProviderId,
  RecoveryExperienceService,
} from "./RecoveryExperienceService";

function resolveProviderId(): RecoveryExperienceProviderId {
  const candidate = process.env.EXPO_PUBLIC_RECOVERY_EXPERIENCE_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createRecoveryExperienceService(): RecoveryExperienceService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendRecoveryExperienceService;
  }
  if (providerId === "local") {
    return localRecoveryExperienceService;
  }
  return mockRecoveryExperienceService;
}

export const recoveryExperienceService = createRecoveryExperienceService();
