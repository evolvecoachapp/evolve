import { backendHomeService } from "../providers/BackendHomeService";
import { localHomeService } from "../providers/LocalHomeService";
import { mockHomeService } from "../providers/MockHomeService";
import type { HomeProviderId, HomeService } from "../types/homeService";

const PROVIDERS: Record<HomeProviderId, HomeService> = {
  mock: mockHomeService,
  backend: backendHomeService,
  local: localHomeService,
};

/** Resolves the active provider from env — defaults to mock when unset or unknown. */
export function resolveHomeProviderId(): HomeProviderId {
  const configured = process.env.EXPO_PUBLIC_HOME_PROVIDER as HomeProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "mock";
}

export function createHomeService(providerId: HomeProviderId = resolveHomeProviderId()): HomeService {
  return PROVIDERS[providerId];
}
