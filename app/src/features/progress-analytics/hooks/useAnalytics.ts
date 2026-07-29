import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ProgressAnalyticsService } from "../services";
import { ProgressAnalyticsViewModel } from "../viewmodels";

export interface UseAnalyticsOptions {
  readonly service?: ProgressAnalyticsService;
  readonly viewModel?: ProgressAnalyticsViewModel;
  readonly autoLoad?: boolean;
}

export function useAnalytics({
  service,
  viewModel: injected,
  autoLoad = true,
}: UseAnalyticsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProgressAnalyticsViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  useEffect(() => {
    if (autoLoad && !injected) {
      void viewModel.loadAnalytics();
    }
  }, [autoLoad, injected, viewModel]);

  return {
    period: viewModel.period,
    filter: viewModel.filter,
    summary: viewModel.summary,
    workoutHistory: viewModel.workoutHistory,
    workoutStatistics: viewModel.workoutStatistics,
    strengthProgress: viewModel.strengthProgress,
    volumeProgress: viewModel.volumeProgress,
    bodyMeasurements: viewModel.bodyMeasurements,
    bodyComposition: viewModel.bodyComposition,
    bodyWeightHistory: viewModel.bodyWeightHistory,
    nutritionStatistics: viewModel.nutritionStatistics,
    recoveryStatistics: viewModel.recoveryStatistics,
    sleepStatistics: viewModel.sleepStatistics,
    performanceTrends: viewModel.performanceTrends,
    goalProgress: viewModel.goalProgress,
    personalRecords: viewModel.personalRecords,
    trainingConsistency: viewModel.trainingConsistency,
    charts: viewModel.charts,
    snapshot: viewModel.snapshot,
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    refresh: useCallback(() => viewModel.refresh(), [viewModel]),
    loadAnalytics: useCallback(() => viewModel.loadAnalytics(), [viewModel]),
    viewModel,
  };
}
