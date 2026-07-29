import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProgressExperienceService } from "../services";
import { ProgressExperienceViewModel } from "../viewmodels";

export interface UseProgressDashboardOptions {
  readonly service?: ProgressExperienceService;
  readonly viewModel?: ProgressExperienceViewModel;
  readonly autoLoad?: boolean;
}

export function useProgressDashboard({ service, viewModel: injected, autoLoad = true }: UseProgressDashboardOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(() => injected ?? new ProgressExperienceViewModel({ service }), [injected, service]);

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
    isEmpty: viewModel.isEmpty,
    timeRange: viewModel.timeRange,
    refresh: useCallback(() => viewModel.refresh(), [viewModel]),
    loadDashboard: useCallback(() => viewModel.loadDashboard(), [viewModel]),
    changeTimeRange: useCallback((nextTimeRange: string) => viewModel.changeTimeRange(nextTimeRange), [viewModel]),
    viewModel,
  };
}
