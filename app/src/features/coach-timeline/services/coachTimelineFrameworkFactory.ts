import { backendCoachTimelineService } from "../providers/BackendCoachTimelineService";
import { localCoachTimelineService } from "../providers/LocalCoachTimelineService";
import { mockCoachTimelineService } from "../providers/MockCoachTimelineService";
import type {
  CoachTimelineFrameworkService,
  CoachTimelineProviderId,
} from "./CoachTimelineFrameworkService";

function resolveProviderId(): CoachTimelineProviderId {
  const candidate = process.env.EXPO_PUBLIC_COACH_TIMELINE_PROVIDER;
  if (candidate === "backend" || candidate === "local" || candidate === "mock") {
    return candidate;
  }
  return "mock";
}

export function createCoachTimelineFrameworkService(): CoachTimelineFrameworkService {
  const providerId = resolveProviderId();
  if (providerId === "backend") {
    return backendCoachTimelineService;
  }
  if (providerId === "local") {
    return localCoachTimelineService;
  }
  return mockCoachTimelineService;
}

export { resolveProviderId as resolveCoachTimelineProviderId };
