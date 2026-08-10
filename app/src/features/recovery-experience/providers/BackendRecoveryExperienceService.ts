import { RecoveryExperienceError } from "../services/RecoveryExperienceService";
import type { RecoveryExperienceService } from "../services/RecoveryExperienceService";

function notConfigured(): never {
  throw new RecoveryExperienceError(
    "Recovery experience backend provider is not configured.",
    "backend",
  );
}

export const backendRecoveryExperienceService: RecoveryExperienceService = {
  providerId: "backend",
  async getDashboard() {
    return notConfigured();
  },
  async logSleep() {
    return notConfigured();
  },
  async updateReadiness() {
    return notConfigured();
  },
  async assessRecovery() {
    return notConfigured();
  },
};
