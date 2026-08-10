import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRuntimeSession } from "../../../runtime/session/RuntimeSessionContext";
import { RUNTIME_SESSION_STATUS } from "../../../runtime/session/RuntimeSessionStatus";
import { loadHydratedNutritionExperience } from "../application/loadHydratedNutritionExperience";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceViewModel } from "../viewmodels";

export interface UseNutritionDashboardOptions {
  readonly service?: NutritionExperienceService;
  readonly viewModel?: NutritionExperienceViewModel;
  readonly athleteId?: string;
  readonly autoLoad?: boolean;
}

/**
 * Subscribes to NutritionExperienceViewModel — no business logic in the hook.
 * Production path applies hydrated workspace output via applyHydratedDashboard().
 * NutritionExperienceService is test/preview-only when injected explicitly.
 */
export function useNutritionDashboard({
  service,
  viewModel: injected,
  athleteId,
  autoLoad = true,
}: UseNutritionDashboardOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const { status: runtimeStatus } = useRuntimeSession();
  const isRuntimePath = service === undefined && injected === undefined;
  const athleteKey = athleteId ?? "";

  const viewModel = useMemo(
    () => injected ?? new NutritionExperienceViewModel({ service, athleteId }),
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

    void loadHydratedNutritionExperience({ athleteId }).then((dashboard) => {
      if (cancelled) {
        return;
      }

      if (dashboard) {
        viewModel.applyHydratedDashboard(dashboard);
        return;
      }

      viewModel.applyNutritionFailure("Nutrition runtime unavailable.");
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
      viewModel.applyNutritionFailure("Nutrition runtime unavailable.");
      return;
    }

    const dashboard = await loadHydratedNutritionExperience({ athleteId, day: viewModel.day });
    viewModel.refreshFromHydratedDashboard(dashboard);
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
      (day: Parameters<NutritionExperienceViewModel["changeDay"]>[0]) =>
        viewModel.changeDay(day),
      [viewModel],
    ),
    toggleMealCompletion: useCallback(
      (mealId: string) => viewModel.toggleMealCompletion(mealId),
      [viewModel],
    ),
    logHydration: useCallback(
      (amountMl: number) => viewModel.logHydration(amountMl),
      [viewModel],
    ),
    viewModel,
  };
}
