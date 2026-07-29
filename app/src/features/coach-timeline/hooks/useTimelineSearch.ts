import { useEffect, useMemo, useReducer } from "react";
import type { CoachTimelineFrameworkService } from "../services";
import { CoachTimelineViewModel } from "../viewmodels";

export interface UseTimelineSearchOptions {
  readonly service?: CoachTimelineFrameworkService;
  readonly viewModel?: CoachTimelineViewModel;
}

export function useTimelineSearch({
  service,
  viewModel: injected,
}: UseTimelineSearchOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new CoachTimelineViewModel({ service }),
    [injected, service],
  );
  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  return {
    searchQuery: viewModel.searchQuery,
    events: viewModel.events,
    viewModel,
  };
}
