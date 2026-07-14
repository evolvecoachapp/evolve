import { backendProgressService } from "../providers/BackendProgressService";
import { localProgressService } from "../providers/LocalProgressService";
import { mockProgressService } from "../providers/MockProgressService";
import type { ProgressProviderId, ProgressService } from "./progressService";

const PROVIDERS: Record<ProgressProviderId, ProgressService> = {
  mock: mockProgressService,
  backend: backendProgressService,
  local: localProgressService,
};

/** Resolves the active provider from env — defaults to mock when unset or unknown. */
export function resolveProgressProviderId(): ProgressProviderId {
  const configured = process.env.EXPO_PUBLIC_PROGRESS_PROVIDER as ProgressProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "mock";
}

export function createProgressService(
  providerId: ProgressProviderId = resolveProgressProviderId(),
): ProgressService {
  return PROVIDERS[providerId];
}
