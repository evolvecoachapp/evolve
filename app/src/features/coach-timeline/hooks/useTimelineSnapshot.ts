import { useEffect, useMemo, useReducer } from "react";
import type { CoachTimelineFrameworkService } from "../services";
import { CoachTimelineViewModel } from "../viewmodels";

export interface UseTimelineSnapshotOptions {
  readonly service?: CoachTimelineFrameworkService;
  readonly viewModel?: CoachTimelineViewModel;
}

export function useTimelineSnapshot({
  service,
  viewModel: injected,
}: UseTimelineSnapshotOptions = {}) {
  const [, bump] = useReducer((count: number) => count + 1, 0);
  const viewModel = useMemo(
    () => injected ?? new CoachTimelineViewModel({ service }),
    [injected, service],
  );
  useEffect(() => viewModel.subscribe(bump), [viewModel]);
  return {
    snapshot: viewModel.snapshot,
    viewModel,
  };
}
