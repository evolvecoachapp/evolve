import { useEffect, useMemo, useReducer } from "react";
import type { ProgressAnalyticsService } from "../services";
import { ProgressAnalyticsViewModel } from "../viewmodels";

export interface UseWorkoutHistoryOptions {
  readonly service?: ProgressAnalyticsService;
  readonly viewModel?: ProgressAnalyticsViewModel;
}

export function useWorkoutHistory({ service, viewModel: injected }: UseWorkoutHistoryOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProgressAnalyticsViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    workoutHistory: viewModel.workoutHistory,
    viewModel,
  };
}
