import { validateBootstrapIsReady } from "../bootstrap/RuntimeBootstrapValidation";
import { getBootstrapStateHolder } from "../bootstrap/BootstrapStateHolder";
import type { HydrationState } from "./HydrationState";
import { HYDRATION_STATUS } from "./HydrationStatus";
import { HydrationError } from "./HydrationError";

export function validateHydrationState(state: HydrationState): void {
  if (state.status === HYDRATION_STATUS.ready && state.result === null) {
    throw new HydrationError(
      "Hydration state marked ready without a result",
      "invalid_hydration_state",
    );
  }

  if (state.status === HYDRATION_STATUS.failed && state.error === null) {
    throw new HydrationError(
      "Hydration state marked failed without an error",
      "invalid_hydration_state",
    );
  }

  if (
    state.status === HYDRATION_STATUS.hydrating &&
    state.completedAt !== null
  ) {
    throw new HydrationError(
      "Hydration state marked hydrating with a completion timestamp",
      "invalid_hydration_state",
    );
  }
}

export function validateHydrationCanStart(state: HydrationState): void {
  if (
    state.status === HYDRATION_STATUS.hydrating ||
    state.status === HYDRATION_STATUS.ready
  ) {
    throw new HydrationError(
      "Repository hydration has already started",
      "hydration_already_started",
    );
  }
}

export function validateBootstrapReadyForHydration(): void {
  try {
    validateBootstrapIsReady(getBootstrapStateHolder());
  } catch {
    throw new HydrationError(
      "Runtime bootstrap must complete before repository hydration",
      "bootstrap_not_ready",
    );
  }
}
