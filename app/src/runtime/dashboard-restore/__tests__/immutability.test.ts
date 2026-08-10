import { createDashboardRestoreResult } from "../DashboardRestoreResult";
import { createDashboardRestoreState } from "../DashboardRestoreState";
import { DASHBOARD_RESTORE_STATUS } from "../DashboardRestoreStatus";
import { DashboardRestoreError } from "../DashboardRestoreError";
import { DASHBOARD_RESTORE_PHASES } from "../DashboardRestoreInitialization";
import { createEmptyHomeDashboard } from "../DashboardRestoreRestoration";

describe("dashboard restore immutability", () => {
  it("freezes dashboard restore state and results", () => {
    const primaryDashboard = createEmptyHomeDashboard();
    const result = createDashboardRestoreResult({
      athleteCount: 0,
      projectedCount: 0,
      emptyCount: 1,
      restoredAt: "2026-08-10T10:00:00.000Z",
      phases: DASHBOARD_RESTORE_PHASES,
      primaryDashboard,
    });

    const state = createDashboardRestoreState({
      status: DASHBOARD_RESTORE_STATUS.ready,
      result,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.phases)).toBe(true);
    expect(Object.isFrozen(result.primaryDashboard)).toBe(true);
  });

  it("freezes failed dashboard restore state with errors", () => {
    const error = new DashboardRestoreError(
      "Dashboard restore failed",
      "projection_failed",
    );

    const state = createDashboardRestoreState({
      status: DASHBOARD_RESTORE_STATUS.failed,
      error,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
  });
});
