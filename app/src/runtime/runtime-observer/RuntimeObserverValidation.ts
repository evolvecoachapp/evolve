import { validateBootstrapIsReady } from "../bootstrap/RuntimeBootstrapValidation";
import { getBootstrapStateHolder } from "../bootstrap/BootstrapStateHolder";
import type { RuntimeObserverState } from "./RuntimeObserverState";
import { RUNTIME_OBSERVER_STATUS } from "./RuntimeObserverStatus";
import { RuntimeObserverError } from "./RuntimeObserverError";

export function validateRuntimeObserverState(
  state: RuntimeObserverState,
): void {
  if (
    state.status === RUNTIME_OBSERVER_STATUS.ready &&
    state.result === null
  ) {
    throw new RuntimeObserverError(
      "Observer state marked ready without a result",
      "invalid_observer_state",
    );
  }

  if (
    state.status === RUNTIME_OBSERVER_STATUS.failed &&
    state.error === null
  ) {
    throw new RuntimeObserverError(
      "Observer state marked failed without an error",
      "invalid_observer_state",
    );
  }

  if (
    state.status === RUNTIME_OBSERVER_STATUS.observing &&
    state.completedAt !== null
  ) {
    throw new RuntimeObserverError(
      "Observer state marked observing with a completion timestamp",
      "invalid_observer_state",
    );
  }
}

export function validateRuntimeObserverCanStart(
  state: RuntimeObserverState,
): void {
  if (
    state.status === RUNTIME_OBSERVER_STATUS.observing ||
    state.status === RUNTIME_OBSERVER_STATUS.ready
  ) {
    throw new RuntimeObserverError(
      "Runtime observer has already started",
      "observe_already_started",
    );
  }
}

export function validateBootstrapReadyForObserver(): void {
  try {
    validateBootstrapIsReady(getBootstrapStateHolder());
  } catch {
    throw new RuntimeObserverError(
      "Runtime bootstrap must complete before observation can start",
      "bootstrap_not_ready",
    );
  }
}
