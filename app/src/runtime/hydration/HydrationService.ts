import type { HydrationResult } from "./HydrationResult";
import type { HydrationState } from "./HydrationState";
import { getHydrationStateHolder } from "./HydrationStateHolder";
import type { HydrationStatus } from "./HydrationStatus";
import { HYDRATION_STATUS } from "./HydrationStatus";

/**
 * Read-only facade over the process-wide Repository Hydration state.
 * Resolved from the Composition Root after bootstrap completes.
 */
export class HydrationService {
  getStatus(): HydrationStatus {
    return getHydrationStateHolder().status;
  }

  getState(): HydrationState {
    return getHydrationStateHolder();
  }

  isReady(): boolean {
    return getHydrationStateHolder().status === HYDRATION_STATUS.ready;
  }

  getResult(): HydrationResult | null {
    return getHydrationStateHolder().result;
  }
}

/** Composition Root registration alias. */
export type RepositoryHydrationService = HydrationService;
