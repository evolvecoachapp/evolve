import { useEffect, useMemo, useReducer } from "react";
import type { CoachTimelineFrameworkService } from "../services";
import { CoachTimelineViewModel } from "../viewmodels";

export interface UseTimelineStatisticsOptions {
  readonly service?: CoachTimelineFrameworkService;
  readonly viewModel?: CoachTimelineViewModel;
}

export function useTimelineStatistics({
  service,
  viewModel: injected,
}: UseTimelineStatisticsOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new CoachTimelineViewModel({ service }),
    [injected, service],
  );
  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  return {
    statistics: viewModel.statistics,
    viewModel,
  };
}
