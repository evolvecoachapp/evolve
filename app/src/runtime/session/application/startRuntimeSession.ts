import type { CompositionRootOptions } from "../../../core/composition/CompositionRoot";
import type { FirstRunIdentitySeed } from "../initializeFirstRunRuntime";
import type { RuntimeSessionResult } from "../RuntimeSessionResult";
import {
  getRuntimeSessionPromise,
  RuntimeSessionOrchestrator,
  setRuntimeSessionPromise,
} from "../RuntimeSessionOrchestrator";
import { getRuntimeSessionStateHolder } from "../RuntimeSessionStateHolder";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";

export interface StartRuntimeSessionOptions {
  readonly compositionRoot?: CompositionRootOptions;
  readonly athleteIds?: readonly string[];
  readonly identitySeed?: FirstRunIdentitySeed;
  readonly clock?: () => string;
}

/**
 * Start the complete runtime session (bootstrap → hydrate → first-run init → restore dashboard).
 * Idempotent — subsequent calls return the same result promise.
 */
export function startRuntimeSession(
  options: StartRuntimeSessionOptions = {},
): Promise<RuntimeSessionResult> {
  const state = getRuntimeSessionStateHolder();

  if (state.status === RUNTIME_SESSION_STATUS.ready && state.result !== null) {
    return Promise.resolve(state.result);
  }

  const inFlight = getRuntimeSessionPromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(() =>
    RuntimeSessionOrchestrator.start(options),
  );
  setRuntimeSessionPromise(next);
  return next;
}
