import { validateBootstrapIsReady } from "../bootstrap/RuntimeBootstrapValidation";
import { getBootstrapStateHolder } from "../bootstrap/BootstrapStateHolder";
import type { RuntimeWriteThroughState } from "./RuntimeWriteThroughState";
import { RUNTIME_WRITE_THROUGH_STATUS } from "./RuntimeWriteThroughStatus";
import { RuntimeWriteThroughError } from "./RuntimeWriteThroughError";

export function validateRuntimeWriteThroughState(
  state: RuntimeWriteThroughState,
): void {
  if (
    state.status === RUNTIME_WRITE_THROUGH_STATUS.ready &&
    state.result === null
  ) {
    throw new RuntimeWriteThroughError(
      "Write-through state marked ready without a result",
      "invalid_persist_state",
    );
  }

  if (
    state.status === RUNTIME_WRITE_THROUGH_STATUS.failed &&
    state.error === null
  ) {
    throw new RuntimeWriteThroughError(
      "Write-through state marked failed without an error",
      "invalid_persist_state",
    );
  }

  if (
    state.status === RUNTIME_WRITE_THROUGH_STATUS.persisting &&
    state.completedAt !== null
  ) {
    throw new RuntimeWriteThroughError(
      "Write-through state marked persisting with a completion timestamp",
      "invalid_persist_state",
    );
  }
}

export function validateRuntimeWriteThroughCanStart(
  state: RuntimeWriteThroughState,
): void {
  if (
    state.status === RUNTIME_WRITE_THROUGH_STATUS.persisting ||
    state.status === RUNTIME_WRITE_THROUGH_STATUS.ready
  ) {
    throw new RuntimeWriteThroughError(
      "Runtime write-through has already started",
      "persist_already_started",
    );
  }
}

export function validateBootstrapReadyForWriteThrough(): void {
  try {
    validateBootstrapIsReady(getBootstrapStateHolder());
  } catch {
    throw new RuntimeWriteThroughError(
      "Runtime bootstrap must complete before write-through persistence",
      "bootstrap_not_ready",
    );
  }
}
