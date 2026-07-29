import { useEffect, useMemo, useReducer } from "react";
import type { CoachTimelineFrameworkService } from "../services";
import { CoachTimelineViewModel } from "../viewmodels";

export interface UseTimelineFiltersOptions {
  readonly service?: CoachTimelineFrameworkService;
  readonly viewModel?: CoachTimelineViewModel;
}

export function useTimelineFilters({
  service,
  viewModel: injected,
}: UseTimelineFiltersOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new CoachTimelineViewModel({ service }),
    [injected, service],
  );
  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  return {
    filter: viewModel.filter,
    period: viewModel.period,
    viewModel,
  };
}
