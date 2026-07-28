import { backendCoachExperienceService } from "../providers/BackendCoachExperienceService";
import { localCoachExperienceService } from "../providers/LocalCoachExperienceService";
import { mockCoachExperienceService } from "../providers/MockCoachExperienceService";
import type {
  CoachExperienceProviderId,
  CoachExperienceService,
} from "../types/coachExperienceService";

const PROVIDERS: Record<CoachExperienceProviderId, CoachExperienceService> = {
  mock: mockCoachExperienceService,
  backend: backendCoachExperienceService,
  local: localCoachExperienceService,
};

/** Resolves the active provider from env — defaults to mock. */
export function resolveCoachExperienceProviderId(): CoachExperienceProviderId {
  const configured = process.env
    .EXPO_PUBLIC_COACH_EXPERIENCE_PROVIDER as
    | CoachExperienceProviderId
    | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "mock";
}

export function createCoachExperienceService(
  providerId: CoachExperienceProviderId = resolveCoachExperienceProviderId(),
): CoachExperienceService {
  return PROVIDERS[providerId];
}
