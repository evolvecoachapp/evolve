import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { HydrationResult } from "../HydrationResult";
import {
  RepositoryHydrationPipeline,
  getRepositoryHydrationPromise,
  setRepositoryHydrationPromise,
} from "../RepositoryHydrationPipeline";
import { getHydrationStateHolder } from "../HydrationStateHolder";
import { HYDRATION_STATUS } from "../HydrationStatus";

/**
 * Hydrate the application runtime from persistence contract repositories.
 * Idempotent — subsequent calls return the same result promise.
 */
export function hydrateRuntime(): Promise<HydrationResult> {
  const state = getHydrationStateHolder();

  if (state.status === HYDRATION_STATUS.ready && state.result !== null) {
    return Promise.resolve(state.result);
  }

  const inFlight = getRepositoryHydrationPromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(() => {
    const root = getCompositionRoot();
    const adapters = root.resolve("RepositoryAdapters");

    return RepositoryHydrationPipeline.hydrate({
      deps: {
        identityRepository: adapters.identity,
        runtimeRepository: adapters.runtime,
        workspaceRepository: adapters.workspace,
        athleteIdentityService: root.resolve("AthleteIdentityService"),
        runtimeEnvironmentService: root.resolve("RuntimeEnvironmentService"),
        unifiedWorkspaceService: root.resolve("UnifiedWorkspaceService"),
      },
    });
  });

  setRepositoryHydrationPromise(next);
  return next;
}
