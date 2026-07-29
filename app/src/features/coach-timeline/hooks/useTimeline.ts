import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { CoachTimelineFrameworkService, TimelineFilterDto } from "../services";
import { CoachTimelineViewModel } from "../viewmodels";

export interface UseTimelineOptions {
  readonly service?: CoachTimelineFrameworkService;
  readonly viewModel?: CoachTimelineViewModel;
  readonly autoLoad?: boolean;
}

export function useTimeline({
  service,
  viewModel: injected,
  autoLoad = true,
}: UseTimelineOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new CoachTimelineViewModel({ service }),
    [injected, service],
  );

  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  useEffect(() => {
    if (autoLoad && !injected) {
      void viewModel.loadTimeline();
    }
  }, [autoLoad, injected, viewModel]);

  return {
    period: viewModel.period,
    filter: viewModel.filter,
    events: viewModel.events,
    groups: viewModel.groups,
    sections: viewModel.sections,
    statistics: viewModel.statistics,
    pagination: viewModel.pagination,
    searchQuery: viewModel.searchQuery,
    snapshot: viewModel.snapshot,
    loading: viewModel.loading,
    error: viewModel.error,
    isEmpty: viewModel.isEmpty,
    hasMore: viewModel.hasMore,
    refresh: useCallback(() => viewModel.refresh(), [viewModel]),
    loadTimeline: useCallback(() => viewModel.loadTimeline(), [viewModel]),
    loadMore: useCallback(() => viewModel.loadMore(), [viewModel]),
    applyFilter: useCallback(
      (filter: TimelineFilterDto) => viewModel.applyFilter(filter),
      [viewModel],
    ),
    search: useCallback(
      (query: string, filter?: TimelineFilterDto) => viewModel.search(query, filter),
      [viewModel],
    ),
    viewModel,
  };
}
