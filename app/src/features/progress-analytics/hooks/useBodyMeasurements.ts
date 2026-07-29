import { useEffect, useMemo, useReducer } from "react";
import type { ProgressAnalyticsService } from "../services";
import { ProgressAnalyticsViewModel } from "../viewmodels";

export interface UseBodyMeasurementsOptions {
  readonly service?: ProgressAnalyticsService;
  readonly viewModel?: ProgressAnalyticsViewModel;
}

export function useBodyMeasurements({ service, viewModel: injected }: UseBodyMeasurementsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new ProgressAnalyticsViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    bodyMeasurements: viewModel.bodyMeasurements,
    bodyComposition: viewModel.bodyComposition,
    bodyWeightHistory: viewModel.bodyWeightHistory,
    viewModel,
  };
}
