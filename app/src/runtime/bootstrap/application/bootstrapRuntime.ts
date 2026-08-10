import type { BootstrapResult } from "../BootstrapResult";
import {
  RuntimeBootstrap,
  getRuntimeBootstrapPromise,
  setRuntimeBootstrapPromise,
  type RuntimeBootstrapOptions,
} from "../RuntimeBootstrap";
import { getBootstrapStateHolder } from "../BootstrapStateHolder";
import { BOOTSTRAP_STATUS } from "../BootstrapStatus";

/**
 * Bootstrap the application runtime (Composition Root + Service Registry validation).
 * Idempotent — subsequent calls return the same result promise.
 */
export function bootstrapRuntime(
  options: RuntimeBootstrapOptions = {},
): Promise<BootstrapResult> {
  const state = getBootstrapStateHolder();

  if (state.status === BOOTSTRAP_STATUS.ready && state.result !== null) {
    return Promise.resolve(state.result);
  }

  const inFlight = getRuntimeBootstrapPromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(() => RuntimeBootstrap.bootstrap(options));
  setRuntimeBootstrapPromise(next);
  return next;
}
