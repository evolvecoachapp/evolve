import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { DashboardRestoreResult } from "../DashboardRestoreResult";
import {
  DashboardRestorePipeline,
  getDashboardRestorePromise,
  setDashboardRestorePromise,
} from "../DashboardRestorePipeline";
import { getDashboardRestoreStateHolder } from "../DashboardRestoreStateHolder";
import { DASHBOARD_RESTORE_STATUS } from "../DashboardRestoreStatus";

export interface RestoreDashboardOptions {
  readonly athleteIds?: readonly string[];
}

/**
 * Restore the Home dashboard read model from Unified Workspace snapshots.
 * Idempotent — subsequent calls return the same result promise.
 */
export function restoreDashboard(
  options: RestoreDashboardOptions = {},
): Promise<DashboardRestoreResult> {
  const state = getDashboardRestoreStateHolder();

  if (state.status === DASHBOARD_RESTORE_STATUS.ready && state.result !== null) {
    return Promise.resolve(state.result);
  }

  const inFlight = getDashboardRestorePromise();
  if (inFlight) {
    return inFlight;
  }

  const next = Promise.resolve().then(() => {
    const root = getCompositionRoot();

    return DashboardRestorePipeline.restore({
      athleteIds: options.athleteIds,
      deps: {
        unifiedWorkspaceService: root.resolve("UnifiedWorkspaceService"),
        dashboardProjector: root.resolve("DashboardProjector"),
        athleteIdentityService: root.resolve("AthleteIdentityService"),
      },
    });
  });

  setDashboardRestorePromise(next);
  return next;
}
