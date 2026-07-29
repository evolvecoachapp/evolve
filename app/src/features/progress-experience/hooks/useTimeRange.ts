import { useCallback, useEffect, useMemo, useReducer } from "react";
import { TIME_RANGE_OPTIONS, type TimeRange } from "../models";
import type { ProgressExperienceService } from "../services";
import { ProgressExperienceViewModel } from "../viewmodels";

export interface UseTimeRangeOptions {
  readonly service?: ProgressExperienceService;
  readonly viewModel?: ProgressExperienceViewModel;
}

export function useTimeRange({ service, viewModel: injected }: UseTimeRangeOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(() => injected ?? new ProgressExperienceViewModel({ service }), [injected, service]);

  useEffect(() => viewModel.subscribe(bump), [viewModel]);

  return {
    timeRange: viewModel.timeRange,
    options: TIME_RANGE_OPTIONS,
    changeRange: useCallback((timeRange: TimeRange) => viewModel.changeTimeRange(timeRange), [viewModel]),
    viewModel,
  };
}
