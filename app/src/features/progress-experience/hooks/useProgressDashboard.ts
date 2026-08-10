import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedProgressExperience } from "../application/loadHydratedProgressExperience";
import type { ProgressExperienceService } from "../services";
import { ProgressExperienceViewModel } from "../viewmodels";

export interface UseProgressDashboardOptions {
  readonly service?: ProgressExperienceService;
  readonly viewModel?: ProgressExperienceViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to ProgressExperienceViewModel — no business logic.
 * Production path applies Progress Analytics read models via applyHydratedProgress().
 * ProgressExperienceService is test/preview-only when injected explicitly.
 */
export function useProgressDashboard({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseProgressDashboardOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new ProgressExperienceViewModel({ service, athleteId }),
    [injected, service, athleteId],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  useEffect(() => {
    if (!autoLoad || injected) {
      return;
    }

    if (!isRuntimePath) {
      void viewModel.loadDashboard();
      return;
    }

    if (!athleteId) {
      return;
    }

    if (runtimeStatus !== RUNTIME_SESSION_STATUS.ready) {
      return;
    }

    let cancelled = false;

    void loadHydratedProgressExperience({
      athleteId,
      timeRange: viewModel.timeRange,
    }).then((dashboard) => {
      if (cancelled) {
        return;
      }

      if (dashboard) {
        viewModel.applyHydratedProgress(dashboard);
        return;
      }

      viewModel.applyProgressFailure("Progress analytics runtime unavailable.");
    });

    return () => {
      cancelled = true;
    };
  }, [autoLoad, injected, viewModel, isRuntimePath, athleteKey, athleteId, runtimeStatus]);

  const refresh = useCallback(async () => {
    if (service) {
      await viewModel.refresh();
      return;
    }

    if (!athleteId) {
      viewModel.applyProgressFailure("Progress analytics runtime unavailable.");
      return;
    }

    const dashboard = await loadHydratedProgressExperience({
      athleteId,
      timeRange: viewModel.timeRange,
    });
    viewModel.refreshFromHydratedProgress(dashboard);
  }, [viewModel, service, athleteId]);

  return {
    dashboard: viewModel.dashboard,
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    timeRange: viewModel.timeRange,
    refresh,
    loadDashboard: useCallback(() => viewModel.loadDashboard(), [viewModel]),
    changeTimeRange: useCallback(
      (nextTimeRange: string) => viewModel.changeTimeRange(nextTimeRange),
      [viewModel],
    ),
    viewModel,
  };
}
