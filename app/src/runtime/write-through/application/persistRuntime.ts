import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { RuntimeWriteThroughResult } from "../RuntimeWriteThroughResult";
import {
  getRuntimeWriteThroughPromise,
  RuntimeWriteThroughPipeline,
  setRuntimeWriteThroughPromise,
} from "../RuntimeWriteThroughPipeline";
import { getRuntimeWriteThroughStateHolder } from "../RuntimeWriteThroughStateHolder";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";

export interface PersistRuntimeOptions {
  readonly athleteIds?: readonly string[];
}

/**
 * Persist in-memory runtime state through repository contracts.
 * Idempotent — subsequent calls return the same result promise.
 */
export function persistRuntime(
  options: PersistRuntimeOptions = {},
): Promise<RuntimeWriteThroughResult> {
  const state = getRuntimeWriteThroughStateHolder();

  if (
    state.status === RUNTIME_WRITE_THROUGH_STATUS.ready &&
    state.result !== null
  ) {
    return Promise.resolve(state.result);
  }

  const inFlight = getRuntimeWriteThroughPromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(async () => {
    const root = getCompositionRoot();
    const adapters = root.resolve("RepositoryAdapters");

    return RuntimeWriteThroughPipeline.persist({
      athleteIds: options.athleteIds,
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

  setRuntimeWriteThroughPromise(next);
  return next;
}
