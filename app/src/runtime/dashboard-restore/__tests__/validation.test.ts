import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import {
  RepositoryHydrationPipeline,
  resetRepositoryHydration,
} from "../../hydration/RepositoryHydrationPipeline";
import { createHydrationTestDeps } from "../../testSupport/runtimePersistenceFixtures";
import { createDashboardRestoreState } from "../DashboardRestoreState";
import { DASHBOARD_RESTORE_STATUS } from "../DashboardRestoreStatus";
import { DashboardRestoreError } from "../DashboardRestoreError";
import { resetDashboardRestore } from "../DashboardRestorePipeline";
import {
  validateDashboardRestoreCanStart,
  validateDashboardRestoreState,
  validateHydrationReadyForRestore,
} from "../DashboardRestoreValidation";

describe("dashboard restore validation", () => {
  afterEach(() => {
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("validates dashboard restore state invariants", () => {
    expect(() =>
      validateDashboardRestoreState(
        createDashboardRestoreState({
          status: DASHBOARD_RESTORE_STATUS.ready,
          result: null,
        }),
      ),
    ).toThrow(DashboardRestoreError);

    expect(() =>
      validateDashboardRestoreState(
        createDashboardRestoreState({
          status: DASHBOARD_RESTORE_STATUS.failed,
          error: null,
        }),
      ),
    ).toThrow(DashboardRestoreError);

    expect(() =>
      validateDashboardRestoreState(
        createDashboardRestoreState({
          status: DASHBOARD_RESTORE_STATUS.restoring,
          completedAt: "2026-08-10T10:00:00.000Z",
        }),
      ),
    ).toThrow(DashboardRestoreError);
  });

  it("prevents duplicate restore starts", () => {
    expect(() =>
      validateDashboardRestoreCanStart(
        createDashboardRestoreState({ status: DASHBOARD_RESTORE_STATUS.restoring }),
      ),
    ).toThrow(/already started/i);

    expect(() =>
      validateDashboardRestoreCanStart(
        createDashboardRestoreState({ status: DASHBOARD_RESTORE_STATUS.ready }),
      ),
    ).toThrow(/already started/i);
  });

  it("requires hydration readiness before restore", () => {
    expect(() => validateHydrationReadyForRestore()).toThrow(
      /hydration must complete/i,
    );
  });

  it("allows restore when hydration is ready", async () => {
    RuntimeBootstrap.bootstrap();
    await RepositoryHydrationPipeline.hydrate({
      deps: createHydrationTestDeps(),
    });

    expect(() => validateHydrationReadyForRestore()).not.toThrow();
  });
});
