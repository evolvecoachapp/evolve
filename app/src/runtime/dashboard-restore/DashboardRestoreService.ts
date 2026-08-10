import type { DashboardRestoreResult } from "./DashboardRestoreResult";
import type { DashboardRestoreState } from "./DashboardRestoreState";
import { getDashboardRestoreStateHolder } from "./DashboardRestoreStateHolder";
import type { DashboardRestoreStatus } from "./DashboardRestoreStatus";
import { DASHBOARD_RESTORE_STATUS } from "./DashboardRestoreStatus";

/**
 * Read-only facade over the process-wide Dashboard Restore state.
 * Resolved from the Composition Root after hydration completes.
 */
export class DashboardRestoreService {
  getStatus(): DashboardRestoreStatus {
    return getDashboardRestoreStateHolder().status;
  }

  getState(): DashboardRestoreState {
    return getDashboardRestoreStateHolder();
  }

  isReady(): boolean {
    return (
      getDashboardRestoreStateHolder().status === DASHBOARD_RESTORE_STATUS.ready
    );
  }

  getResult(): DashboardRestoreResult | null {
    return getDashboardRestoreStateHolder().result;
  }
}
