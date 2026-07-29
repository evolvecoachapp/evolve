import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { NutritionExperienceService } from "../services";
import { NutritionExperienceViewModel } from "../viewmodels";

export interface UseNutritionDashboardOptions {
  readonly service?: NutritionExperienceService;
  readonly viewModel?: NutritionExperienceViewModel;
  readonly autoLoad?: boolean;
}

export function useNutritionDashboard({
  service,
  viewModel: injected,
  autoLoad = true,
}: UseNutritionDashboardOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new NutritionExperienceViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  useEffect(() => {
    if (autoLoad && !injected) {
      void viewModel.loadDashboard();
    }
  }, [autoLoad, injected, viewModel]);

  return {
    dashboard: viewModel.dashboard,
    loading: viewModel.loading,
    error: viewModel.error,
    day: viewModel.day,
    availableDays: viewModel.availableDays,
    isEmpty: viewModel.isEmpty,
    refresh: useCallback(() => viewModel.refresh(), [viewModel]),
    loadDashboard: useCallback(() => viewModel.loadDashboard(), [viewModel]),
    changeDay: useCallback((day: Parameters<NutritionExperienceViewModel["changeDay"]>[0]) => viewModel.changeDay(day), [viewModel]),
    toggleMealCompletion: useCallback((mealId: string) => viewModel.toggleMealCompletion(mealId), [viewModel]),
    viewModel,
  };
}
