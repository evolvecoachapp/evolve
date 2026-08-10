import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedRecoveryExperience } from "../application/loadHydratedRecoveryExperience";
import type { RecoveryExperienceService } from "../services";
import { RecoveryExperienceViewModel } from "../viewmodels";

export interface UseRecoveryDashboardOptions {
  readonly service?: RecoveryExperienceService;
  readonly viewModel?: RecoveryExperienceViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to RecoveryExperienceViewModel — no business logic in the hook.
 * Production path applies hydrated workspace output via applyHydratedRecovery().
 * RecoveryExperienceService is test/preview-only when injected explicitly.
 */
export function useRecoveryDashboard({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseRecoveryDashboardOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new RecoveryExperienceViewModel({ service, athleteId }),
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

    void loadHydratedRecoveryExperience({ athleteId }).then((dashboard) => {
      if (cancelled) {
        return;
      }

      if (dashboard) {
        viewModel.applyHydratedRecovery(dashboard);
        return;
      }

      viewModel.applyRecoveryFailure("Recovery runtime unavailable.");
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
      viewModel.applyRecoveryFailure("Recovery runtime unavailable.");
      return;
    }

    const dashboard = await loadHydratedRecoveryExperience({
      athleteId,
      day: viewModel.day,
      sleepHours: viewModel.dashboard?.sleep.hours,
      sleepQuality: viewModel.dashboard?.sleep.quality,
      sleepLogged: viewModel.dashboard?.sleep.logged,
      readinessScore: viewModel.dashboard?.readiness.score,
      assessedScore: viewModel.dashboard?.recoveryScore,
    });
    viewModel.refreshFromHydratedRecovery(dashboard);
  }, [viewModel, service, athleteId]);

  return {
    dashboard: viewModel.dashboard,
    loading: viewModel.loading,
    error: viewModel.error,
    day: viewModel.day,
    availableDays: viewModel.availableDays,
    isEmpty: viewModel.isEmpty,
    refresh,
    loadDashboard: useCallback(() => viewModel.loadDashboard(), [viewModel]),
    changeDay: useCallback(
      (day: Parameters<RecoveryExperienceViewModel["changeDay"]>[0]) =>
        viewModel.changeDay(day),
      [viewModel],
    ),
    logSleep: useCallback(
      (hours: number) => viewModel.logSleep(hours),
      [viewModel],
    ),
    updateReadiness: useCallback(
      (score: number) => viewModel.updateReadiness(score),
      [viewModel],
    ),
    assessRecovery: useCallback(() => viewModel.assessRecovery(), [viewModel]),
    viewModel,
  };
}
