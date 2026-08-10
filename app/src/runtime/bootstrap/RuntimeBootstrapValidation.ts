import type { BootstrapState } from "./BootstrapState";
import { BOOTSTRAP_STATUS } from "./BootstrapStatus";
import { RuntimeBootstrapError } from "./RuntimeBootstrapError";

export function validateBootstrapState(state: BootstrapState): void {
  if (state.status === BOOTSTRAP_STATUS.ready && state.result === null) {
    throw new RuntimeBootstrapError(
      "Bootstrap state marked ready without a result",
      "invalid_bootstrap_state",
    );
  }

  if (state.status === BOOTSTRAP_STATUS.failed && state.error === null) {
    throw new RuntimeBootstrapError(
      "Bootstrap state marked failed without an error",
      "invalid_bootstrap_state",
    );
  }

  if (
    state.status === BOOTSTRAP_STATUS.bootstrapping &&
    state.completedAt !== null
  ) {
    throw new RuntimeBootstrapError(
      "Bootstrap state marked bootstrapping with a completion timestamp",
      "invalid_bootstrap_state",
    );
  }
}

export function validateBootstrapCanStart(state: BootstrapState): void {
  if (
    state.status === BOOTSTRAP_STATUS.bootstrapping ||
    state.status === BOOTSTRAP_STATUS.ready
  ) {
    throw new RuntimeBootstrapError(
      "Runtime bootstrap has already started",
      "bootstrap_already_started",
    );
  }
}

export function validateBootstrapIsReady(state: BootstrapState): void {
  if (state.status !== BOOTSTRAP_STATUS.ready || state.result === null) {
    throw new RuntimeBootstrapError(
      "Runtime bootstrap is not ready",
      "bootstrap_not_ready",
    );
  }
}
