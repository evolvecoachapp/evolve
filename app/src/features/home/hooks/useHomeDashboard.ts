import { useCallback, useEffect, useMemo, useReducer } from "react";
import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import { DASHBOARD_RESTORE_STATUS } from "../../../runtime/dashboard-restore";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import type { AthleteIdentityInput } from "../mappers";
import type { HomeDashboard } from "../models/HomeDashboard";
import type { HomeService } from "../services";
import { HomeDashboardViewModel } from "../viewmodels";

export interface UseHomeDashboardOptions {
  readonly service?: HomeService;
  readonly identity: AthleteIdentityInput;
}

function readRestoredPrimaryDashboard(): HomeDashboard | null {
  const restoreService = getCompositionRoot().resolve("DashboardRestoreService");
  return restoreService.getResult()?.primaryDashboard ?? null;
}

/**
 * Subscribes to HomeDashboardViewModel — no business logic in the hook.
 * Production path applies Dashboard Restore output via applyRestoredDashboard().
 * HomeService is test/preview-only when injected explicitly.
 */
export function useHomeDashboard({
  service,
  identity,
}: UseHomeDashboardOptions) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const identityKey = `${identity.displayName}|${identity.initials}`;
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined;

  const viewModel = useMemo(
    () =>
      new HomeDashboardViewModel({
        service,
        identity,
      }),
    // identity applied via setIdentity / load when identityKey changes
    // eslint-disable-next-line react-hooks/exhaustive-deps -- service identity only
    [service],
  );

  useEffect(() => {
    viewModel.setIdentity(identity);
  }, [viewModel, identityKey, identity]);

  useEffect(() => {
    return viewModel.subscribe(bump);
  }, [viewModel]);

  useEffect(() => {
    if (!isRuntimePath) {
      void viewModel.load();
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    const restoreService = getCompositionRoot().resolve("DashboardRestoreService");

    if (restoreService.getStatus() === DASHBOARD_RESTORE_STATUS.failed) {
      const message =
        restoreService.getState().error?.message ??
        "Dashboard restore failed.";
      viewModel.applyRestoreFailure(message);
      return;
    }

    const dashboard = readRestoredPrimaryDashboard();
    if (dashboard) {
      viewModel.applyRestoredDashboard(dashboard);
      return;
    }

    viewModel.applyRestoreFailure("Dashboard restore unavailable.");
  }, [viewModel, identityKey, isRuntimePath, runtimeStatus]);

  const refresh = useCallback(async () => {
    if (service) {
      await viewModel.refresh();
      return;
    }

    viewModel.refreshFromRestoredDashboard(readRestoredPrimaryDashboard());
  }, [viewModel, service]);

  return {
    dashboard: viewModel.dashboard,
    athlete: viewModel.athlete,
    workout: viewModel.workout,
    nutrition: viewModel.nutrition,
    recovery: viewModel.recovery,
    coach: viewModel.coach,
    quickActions: viewModel.quickActions,
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh,
    viewModel,
  };
}
