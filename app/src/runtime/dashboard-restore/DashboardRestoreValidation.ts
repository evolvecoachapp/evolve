import { getHydrationStateHolder } from "../hydration/HydrationStateHolder";
import { HYDRATION_STATUS } from "../hydration/HydrationStatus";
import type { DashboardRestoreState } from "./DashboardRestoreState";
import { DASHBOARD_RESTORE_STATUS } from "./DashboardRestoreStatus";
import { DashboardRestoreError } from "./DashboardRestoreError";

export function validateDashboardRestoreState(state: DashboardRestoreState): void {
  if (state.status === DASHBOARD_RESTORE_STATUS.ready && state.result === null) {
    throw new DashboardRestoreError(
      "Dashboard restore state marked ready without a result",
      "invalid_restore_state",
    );
  }

  if (state.status === DASHBOARD_RESTORE_STATUS.failed && state.error === null) {
    throw new DashboardRestoreError(
      "Dashboard restore state marked failed without an error",
      "invalid_restore_state",
    );
  }

  if (
    state.status === DASHBOARD_RESTORE_STATUS.restoring &&
    state.completedAt !== null
  ) {
    throw new DashboardRestoreError(
      "Dashboard restore state marked restoring with a completion timestamp",
      "invalid_restore_state",
    );
  }
}

export function validateDashboardRestoreCanStart(
  state: DashboardRestoreState,
): void {
  if (
    state.status === DASHBOARD_RESTORE_STATUS.restoring ||
    state.status === DASHBOARD_RESTORE_STATUS.ready
  ) {
    throw new DashboardRestoreError(
      "Dashboard restore has already started",
      "restore_already_started",
    );
  }
}

export function validateHydrationReadyForRestore(): void {
  const hydrationState = getHydrationStateHolder();

  if (
    hydrationState.status !== HYDRATION_STATUS.ready ||
    hydrationState.result === null
  ) {
    throw new DashboardRestoreError(
      "Repository hydration must complete before dashboard restore",
      "hydration_not_ready",
    );
  }
}
