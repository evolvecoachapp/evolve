import { createBootstrapResult } from "../../bootstrap/BootstrapResult";
import { RUNTIME_INITIALIZATION_PHASES } from "../../bootstrap/RuntimeInitialization";
import { createDashboardRestoreResult } from "../../dashboard-restore/DashboardRestoreResult";
import { DASHBOARD_RESTORE_PHASES } from "../../dashboard-restore/DashboardRestoreInitialization";
import { createEmptyHomeDashboard } from "../../dashboard-restore/DashboardRestoreRestoration";
import { createHydrationResult } from "../../hydration/HydrationResult";
import { HYDRATION_PHASES } from "../../hydration/HydrationInitialization";
import { createRuntimeSessionResult } from "../RuntimeSessionResult";
import { createRuntimeSessionState } from "../RuntimeSessionState";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import { RuntimeSessionError } from "../RuntimeSessionError";
import { RUNTIME_SESSION_PHASES } from "../RuntimeSessionInitialization";

describe("runtime session immutability", () => {
  it("freezes session state and results", () => {
    const bootstrap = createBootstrapResult({
      serviceTokenCount: 62,
      validatedAt: "2026-08-10T10:00:00.000Z",
      phases: RUNTIME_INITIALIZATION_PHASES,
    });
    const hydration = createHydrationResult({
      identityRecordCount: 0,
      runtimeRecordCount: 0,
      workspaceRecordCount: 0,
      restoredAt: "2026-08-10T10:00:01.000Z",
      phases: HYDRATION_PHASES,
    });
    const dashboardRestore = createDashboardRestoreResult({
      athleteCount: 0,
      projectedCount: 0,
      emptyCount: 1,
      restoredAt: "2026-08-10T10:00:02.000Z",
      phases: DASHBOARD_RESTORE_PHASES,
      primaryDashboard: createEmptyHomeDashboard(),
    });

    const result = createRuntimeSessionResult({
      startedAt: "2026-08-10T10:00:00.000Z",
      completedAt: "2026-08-10T10:00:02.000Z",
      phases: RUNTIME_SESSION_PHASES,
      bootstrap,
      hydration,
      dashboardRestore,
    });

    const state = createRuntimeSessionState({
      status: RUNTIME_SESSION_STATUS.ready,
      result,
      startedAt: "2026-08-10T10:00:00.000Z",
      completedAt: "2026-08-10T10:00:02.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.phases)).toBe(true);
  });

  it("freezes failed session state with errors", () => {
    const error = new RuntimeSessionError(
      "Runtime bootstrap must complete before hydration",
      "bootstrap_failed",
    );

    const state = createRuntimeSessionState({
      status: RUNTIME_SESSION_STATUS.failed,
      error,
      startedAt: "2026-08-10T09:59:59.000Z",
      completedAt: "2026-08-10T10:00:00.000Z",
    });

    expect(Object.isFrozen(state)).toBe(true);
  });
});
