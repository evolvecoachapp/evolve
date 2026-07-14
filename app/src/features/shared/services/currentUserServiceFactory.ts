import { backendUserService } from "../providers/BackendUserService";
import { mockCurrentUserService } from "../providers/MockCurrentUserService";
import type { CurrentUserProviderId, CurrentUserService } from "./CurrentUserService";

const PROVIDERS: Record<CurrentUserProviderId, CurrentUserService> = {
  mock: mockCurrentUserService,
  backend: backendUserService,
};

/** Resolves the active provider from env — defaults to backend when unset or unknown. */
export function resolveCurrentUserProviderId(): CurrentUserProviderId {
  const configured = process.env.EXPO_PUBLIC_USER_PROVIDER as CurrentUserProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "backend";
}

export function createCurrentUserService(
  providerId: CurrentUserProviderId = resolveCurrentUserProviderId(),
): CurrentUserService {
  return PROVIDERS[providerId];
}
