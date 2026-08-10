import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { createBootstrapResult } from "../../bootstrap/BootstrapResult";
import { RUNTIME_INITIALIZATION_PHASES } from "../../bootstrap/RuntimeInitialization";
import { resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import * as bootstrapApplication from "../../bootstrap/application/bootstrapRuntime";
import { createDashboardRestoreResult } from "../../dashboard-restore/DashboardRestoreResult";
import { DASHBOARD_RESTORE_PHASES } from "../../dashboard-restore/DashboardRestoreInitialization";
import { createEmptyHomeDashboard } from "../../dashboard-restore/DashboardRestoreRestoration";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import * as restoreApplication from "../../dashboard-restore/application/restoreDashboard";
import { createHydrationResult } from "../../hydration/HydrationResult";
import { HYDRATION_PHASES } from "../../hydration/HydrationInitialization";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import * as hydrationApplication from "../../hydration/application/hydrateRuntime";
import { HydrationError } from "../../hydration/HydrationError";
import {
  startRuntimeSession,
  getRuntimeSessionStatus,
} from "../application";
import { RUNTIME_SESSION_PHASES } from "../RuntimeSessionInitialization";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import {
  RuntimeSessionOrchestrator,
  resetRuntimeSession,
} from "../RuntimeSessionOrchestrator";
import { RuntimeSessionError } from "../RuntimeSessionError";

describe("RuntimeSessionOrchestrator lifecycle", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    resetRuntimeSession();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("completes bootstrap, hydration, and dashboard restore in order", async () => {
    const callOrder: string[] = [];

    jest.spyOn(bootstrapApplication, "bootstrapRuntime").mockImplementation(async () => {
      callOrder.push("bootstrap");
      return createBootstrapResult({
        serviceTokenCount: 62,
        validatedAt: "2026-08-10T10:00:00.000Z",
        phases: RUNTIME_INITIALIZATION_PHASES,
      });
    });

    jest.spyOn(hydrationApplication, "hydrateRuntime").mockImplementation(async () => {
      callOrder.push("hydrate");
      return createHydrationResult({
        identityRecordCount: 0,
        runtimeRecordCount: 0,
        workspaceRecordCount: 0,
        restoredAt: "2026-08-10T10:00:01.000Z",
        phases: HYDRATION_PHASES,
      });
    });

    jest.spyOn(restoreApplication, "restoreDashboard").mockImplementation(async () => {
      callOrder.push("restore");
      return createDashboardRestoreResult({
        athleteCount: 0,
        projectedCount: 0,
        emptyCount: 1,
        restoredAt: "2026-08-10T10:00:02.000Z",
        phases: DASHBOARD_RESTORE_PHASES,
        primaryDashboard: createEmptyHomeDashboard(),
      });
    });

    const result = await RuntimeSessionOrchestrator.start({
      clock: () => "2026-08-10T10:00:02.000Z",
    });

    expect(callOrder).toEqual(["bootstrap", "hydrate", "restore"]);
    expect(result.status).toBe("ready");
    expect(result.phases).toEqual([...RUNTIME_SESSION_PHASES]);
    expect(result.startedAt).toBe("2026-08-10T10:00:02.000Z");
    expect(result.completedAt).toBe("2026-08-10T10:00:02.000Z");
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.ready);
  });

  it("runs the full startup chain through startRuntimeSession", async () => {
    const result = await startRuntimeSession({
      clock: () => "2026-08-10T10:00:00.000Z",
    });

    expect(result.status).toBe("ready");
    expect(result.bootstrap.status).toBe("ready");
    expect(result.hydration.status).toBe("ready");
    expect(result.dashboardRestore.status).toBe("ready");
    expect(result.phases).toEqual([...RUNTIME_SESSION_PHASES]);
  });

  it("returns the same promise from startRuntimeSession when called twice", async () => {
    const first = startRuntimeSession({
      clock: () => "2026-08-10T10:00:00.000Z",
    });
    const second = startRuntimeSession();

    expect(second).toBe(first);
    await expect(first).resolves.toMatchObject({ status: "ready" });
  });

  it("stops immediately when hydration fails", async () => {
    jest.spyOn(bootstrapApplication, "bootstrapRuntime").mockResolvedValue(
      createBootstrapResult({
        serviceTokenCount: 62,
        validatedAt: "2026-08-10T10:00:00.000Z",
        phases: RUNTIME_INITIALIZATION_PHASES,
      }),
    );

    jest
      .spyOn(hydrationApplication, "hydrateRuntime")
      .mockRejectedValue(
        new HydrationError("Repository contract rejected hydration", "repository_contract_failed"),
      );

    const restoreSpy = jest.spyOn(restoreApplication, "restoreDashboard");

    await expect(
      RuntimeSessionOrchestrator.start({
        clock: () => "2026-08-10T10:00:00.000Z",
      }),
    ).rejects.toMatchObject({
      name: "RuntimeSessionError",
      code: "hydration_failed",
    });

    expect(restoreSpy).not.toHaveBeenCalled();
    expect(getRuntimeSessionStatus()).toBe(RUNTIME_SESSION_STATUS.failed);
  });

  it("propagates session failures as RuntimeSessionError", async () => {
    jest.spyOn(bootstrapApplication, "bootstrapRuntime").mockRejectedValue(
      new Error("Composition Root bootstrap failed"),
    );

    await expect(
      RuntimeSessionOrchestrator.start({
        clock: () => "2026-08-10T10:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(RuntimeSessionError);
  });
});
