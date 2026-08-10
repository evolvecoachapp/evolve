import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { HomeDashboardViewModel } from "../../features/home/viewmodels/HomeDashboardViewModel";
import type { DashboardProjector } from "../../integrations/dashboard-projection/projector/DashboardProjector";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import { createDashboardRestoreResult, type DashboardRestoreResult } from "./DashboardRestoreResult";
import { createDashboardRestoreState } from "./DashboardRestoreState";
import {
  getDashboardRestoreStateHolder,
  resetDashboardRestoreStateHolder,
  setDashboardRestoreStateHolder,
} from "./DashboardRestoreStateHolder";
import { DASHBOARD_RESTORE_STATUS } from "./DashboardRestoreStatus";
import { DashboardRestoreError } from "./DashboardRestoreError";
import {
  createEmptyHomeDashboard,
  restoreDashboardFromWorkspace,
} from "./DashboardRestoreRestoration";
import {
  validateDashboardRestoreCanStart,
  validateDashboardRestoreState,
  validateHydrationReadyForRestore,
} from "./DashboardRestoreValidation";
import { DASHBOARD_RESTORE_PHASES } from "./DashboardRestoreInitialization";

let restorePromise: Promise<DashboardRestoreResult> | null = null;

export interface DashboardRestoreDeps {
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly dashboardProjector: DashboardProjector;
  readonly athleteIdentityService: AthleteIdentityService;
  readonly homeDashboardViewModel?: HomeDashboardViewModel | null;
  readonly clock?: () => string;
}

export interface DashboardRestoreOptions {
  readonly deps: DashboardRestoreDeps;
  readonly athleteIds?: readonly string[];
}

/**
 * Dashboard Restore Pipeline — projects Unified Workspace snapshots into the
 * Home dashboard read model after Repository Hydration completes.
 */
export class DashboardRestorePipeline {
  static restore(
    options: DashboardRestoreOptions,
  ): DashboardRestoreResult {
    const current = getDashboardRestoreStateHolder();
    validateDashboardRestoreCanStart(current);
    validateHydrationReadyForRestore();

    const clock = options.deps.clock ?? (() => new Date().toISOString());
    const startedAt = clock();

    setDashboardRestoreStateHolder(
      createDashboardRestoreState({
        status: DASHBOARD_RESTORE_STATUS.restoring,
        startedAt,
      }),
    );

    try {
      const athleteIds = options.athleteIds ?? Object.freeze([]);
      const restoredAt = clock();

      const restoration =
        athleteIds.length === 0
          ? {
              dashboards: Object.freeze([createEmptyHomeDashboard()]),
              projectedCount: 0,
              emptyCount: 1,
            }
          : restoreDashboardFromWorkspace(options.deps, athleteIds);

      const primaryDashboard =
        restoration.dashboards[0] ?? createEmptyHomeDashboard();

      if (
        athleteIds.length === 0 &&
        options.deps.homeDashboardViewModel
      ) {
        options.deps.homeDashboardViewModel.applyRestoredDashboard(
          primaryDashboard,
        );
      }

      const result = createDashboardRestoreResult({
        athleteCount: athleteIds.length,
        projectedCount: restoration.projectedCount,
        emptyCount: restoration.emptyCount,
        restoredAt,
        phases: DASHBOARD_RESTORE_PHASES,
        primaryDashboard,
      });

      const nextState = createDashboardRestoreState({
        status: DASHBOARD_RESTORE_STATUS.ready,
        result,
        startedAt,
        completedAt: restoredAt,
      });
      validateDashboardRestoreState(nextState);
      setDashboardRestoreStateHolder(nextState);

      return result;
    } catch (error) {
      const restoreError =
        error instanceof DashboardRestoreError
          ? error
          : new DashboardRestoreError(
              error instanceof Error
                ? error.message
                : "Dashboard restore failed",
              "projection_failed",
            );

      setDashboardRestoreStateHolder(
        createDashboardRestoreState({
          status: DASHBOARD_RESTORE_STATUS.failed,
          error: restoreError,
          startedAt,
          completedAt: clock(),
        }),
      );

      throw restoreError;
    }
  }

  static reset(): void {
    restorePromise = null;
    resetDashboardRestoreStateHolder();
  }
}

export function resetDashboardRestore(): void {
  DashboardRestorePipeline.reset();
}

export function getDashboardRestorePromise(): Promise<DashboardRestoreResult> | null {
  return restorePromise;
}

export function setDashboardRestorePromise(
  promise: Promise<DashboardRestoreResult> | null,
): void {
  restorePromise = promise;
}
